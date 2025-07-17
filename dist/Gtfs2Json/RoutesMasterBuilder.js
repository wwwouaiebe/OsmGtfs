/*
Copyright - 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
/*
Changes:
	- v1.0.0:
		- created
Doc reviewed 20250711
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import RouteMaster from '../Common/RouteMaster.js';
import Route from '../Common/Route.js';
import theMySqlDb from './MySqlDb.js';
import ArrayHelper from '../Common/ArrayHelper.js';
import PolylineEncoder from '../Common/PolylineEncoder.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
  * This class build an array of RouteMaster from the db data
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RoutesMasterBuilder {

	/**
	 * The network for witch the RouteMaster objects are build
	 * @type {Object}
	 */

	#network;

	/**
	 * Select in the gtfs db all the platforms ref used by a route
	 * @param {String} shapePk The unique identifier of the route
	 * @returns {Array.<Object>} An array with all the platforms used by the route
	 */

	async #selectPlatformsFromDb ( shapePk ) {

		const dbPlatforms = await theMySqlDb.execSql (
			'SELECT stops.stop_id AS ref ' +
            'FROM stop_times INNER JOIN stops ON stops.stop_pk = stop_times.stop_pk ' +
            'WHERE stop_times.trip_pk = ' +
            '( SELECT trips.trip_pk FROM trips WHERE trips.shape_pk = ' + shapePk + ' LIMIT 1 ) ' +
            'ORDER BY stop_times.stop_sequence;'
		);

		return dbPlatforms;
	}

	/**
	 * Select in the gtfs db all the shapes used by a route and return these encoded with Polyline encoder
	 * @param {String} shapePk The unique identifier of the route
	 * @returns {String} A string with the shape lat and lon encoded
	 */

	async #selectNodesFromDb ( shapePk ) {

		// select
		const nodes = await theMySqlDb.execSql (
			'SELECT shapes.shape_pt_lat AS lat, shapes.shape_pt_lon AS lon ' +
            'FROM shapes WHERE shapes.shape_pk = ' + shapePk + ' ' +
            'ORDER BY shapes.shape_pk, shapes.shape_pt_sequence;'
		);

		// Creating an array of array of numbers. Reminder numbers are coming as string from the db
		const nodesArray = [];
		nodes.forEach (
			node => nodesArray.push ( [ Number.parseFloat ( node.lat ), Number.parseFloat ( node.lon ) ] )
		);

		// encoding the arry with PolylineEncoder and return
		// eslint-disable-next-line no-magic-numbers
		return new PolylineEncoder ( ).encode ( nodesArray, [ 6, 6 ] );
	}

	/**
	 * Build a Route object from the data found in the db
	 * @param {Object} dbRoute An object with the route properties selected in the db
	 * @returns {Route} A Route object with all the properties found from the db
	 */

	async #buildRoute ( dbRoute ) {

		// Building an exclude list if any list existing in the operator file
		let excludeList = [];
		if ( this.#network?.excludeList?.gtfs?.excludedPlatforms ) {
			excludeList = Array.from (
				this.#network.excludeList.gtfs.excludedPlatforms,
				excludedPlatform => excludedPlatform.ref
			);
		}

		// Selecting nodes in the db
		const nodes = await this.#selectNodesFromDb ( dbRoute.shapePk );

		// Selecting platforms in the db
		const dbPlatforms = await this.#selectPlatformsFromDb ( dbRoute.shapePk );

		// Removing duplicate platforms and ecluded platforms
		const platforms = [];

		let previousPlatformRef = '';
		for ( const dbPlatform of dbPlatforms ) {
			if (
				previousPlatformRef !== dbPlatform.ref
				&&
				! excludeList.includes ( dbPlatform.ref )
			) {
				platforms.push ( dbPlatform.ref );
				previousPlatformRef = dbPlatform.ref;
			}
		}

		// Returning a new Route Object
		return new Route (
			{
				shapePk : dbRoute.shapePk,
				startDate : dbRoute.startDate,
				endDate : dbRoute.endDate,
				platforms : platforms,
				nodes : nodes
			}
		);
	}

	/**
	 * Select in the gtfs db all the routes used by a route master
	 * @param {Object} dbRouteMaster The route master for witch the routes are searched
	 * @returns {Array.<Object>} An array of object litteral with the properties of the selected routes
	 */

	async #selectRoutesFromDb ( dbRouteMaster ) {

		// Remember that in some networks the same ref is used for multiple routes master
		// so the description field is needed
		const dbRoutes = await theMySqlDb.execSql (
			'SELECT ' +
				'min(t.start_date) AS startDate,' +
				'max(t.end_date) AS endDate, ' +
				't.route_pk AS routePk, ' +
				't.shape_pk AS shapePk ' +
				'FROM ' +
					'( ' +
						'SELECT DISTINCT ' +
						'calendar.start_date AS start_date, ' +
						'calendar.end_date AS end_date, ' +
						'routes.route_pk AS route_pk, ' +
						'trips.shape_pk AS shape_pk ' +
						'FROM ' +
						'( ' +
							'(routes JOIN trips ON ((routes.route_pk = trips.route_pk)) ' +
						') ' +
						'JOIN calendar ' +
						'ON ((trips.service_pk = calendar.service_pk)) ' +
					') ' +
					'WHERE routes.agency_id = "' + this.#network.gtfsAgencyId + '" ' +
					'AND routes.route_id like "' + this.#network.gtfsIdPrefix + '%"' +
					'AND routes.route_short_name ="' + dbRouteMaster.ref + '" ' +
					'AND routes.route_long_name = "' + dbRouteMaster.description + '" ' +
				')  t ' +
				'GROUP BY ' +
				'shapePk ' +
				'ORDER BY startDate,endDate;'
		);

		return dbRoutes;
	}

	/**
	 * Select in the gtfs db all the routes master contained in the network
	 * @returns {Array.<Object>} An array of object litteral with the properties of the selected routes master
	 */

	async #selectRoutesMasterFromDb ( ) {

		// searching the data in the database
		const dbRoutesMaster = await theMySqlDb.execSql (
			'SELECT DISTINCT ' +
			'routes.route_short_name AS ref, ' +
			'routes.route_long_name AS description, ' +
			'routes.route_type as type ' +
			'FROM routes ' +
            'WHERE routes.agency_id = "' + this.#network.gtfsAgencyId +
			'" AND routes.route_id like "' + this.#network.gtfsIdPrefix + '%";'
		);

		// sorting the routes. Not possible to use an 'order by' sql statement because the sort is a mix
		// of numeric and alphanumeric
		dbRoutesMaster.sort ( ( first, second ) => ArrayHelper.compareRouteName ( first.ref, second.ref ) );

		return dbRoutesMaster;
	}

	/**
	 * Build a RouteMaster object from the values selected in the db
	 * @param {Object} dbRouteMaster An object litteral with the properties of the route master to build
	 * @returns {RouteMaster} A RouteMaster object with all the properties and routes completed with value from the db
	 */

	async #buildRouteMaster ( dbRouteMaster ) {
		const routes = [];

		const dbRoutes = await this.#selectRoutesFromDb ( dbRouteMaster );
		for ( const dbRoute of dbRoutes ) {
			routes.push ( await this.#buildRoute ( dbRoute ) );
		}
		return new RouteMaster (
			{
				description : dbRouteMaster.description,
				ref : dbRouteMaster.ref,
				type : Number.parseInt ( dbRouteMaster.type ),
				routes : routes
			}
		);
	}

	/**
	 * Build an array of RouteMaster attached to a network from the GTFS database
	 * @param {Object} network The network for witch the RouteMaster objects are build
	 * @returns {Array.<RouteMaster>} The routeMaster objects in the network
	 */

	async build ( network ) {

		this.#network = network;
		const routesMaster = [];

		const dbRoutesMaster = await this.#selectRoutesMasterFromDb ( );
		for ( const dbRouteMaster of dbRoutesMaster ) {
			console.info ( 'now building route master ' +
				this.#network.osmNetwork + ' ' +
				dbRouteMaster.ref + ' ' +
				dbRouteMaster.description );
			const routeMaster = await this.#buildRouteMaster ( dbRouteMaster );
			routesMaster.push ( routeMaster );
		}

		return routesMaster;
 	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default RoutesMasterBuilder;