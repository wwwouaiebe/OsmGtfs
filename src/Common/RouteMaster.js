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
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import Route from '../Common/Route.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * An object with all the properties needed for the route master comparison OSM GTFS
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RouteMaster {

	/**
	 * The description of the route master.
	 * For gtfs it's the route_long_name field of the table route
	 * For OSM, it's the description tag of the route master
	 * @type {String}
	 */

	#description;

	/**
	 * The ref of the route master.
	 * For gtfs it's the route_short_name field of the table route
	 * For OSM, it's the ref tag of the route master
	 * @type {String}
	 */

	#ref;

	/**
	 * The type of the route master.
	 * It's a flag indicating the vehicle used on the route master (0 = tram, 3 = bus)
	 * @type {Number}
	 */

	#type;

	/**
	 * An array of Route objects with the routes linked to the route master
	 * @type {Array.<Route>}
	 */

	#routes = [];

	/**
	 * The osmId of the route master
	 * @type {?Number}
	 */

	#osmId;

	/**
	 * The description of the route master.
	 * For gtfs it's the route_long_name field of the table route
	 * For OSM, it's the description tag of the route master
	 * @type {String}
	 */

	get description ( ) { return this.#description; }

	/**
	 * The ref of the route master.
	 * For gtfs it's the route_short_name field of the table route
	 * For OSM, it's the ref tag of the route master
	 * @type {String}
	 */

	get ref ( ) { return this.#ref; }

	/**
	 * The type of the route master.
	 * It's a flag indicating the vehicle used on the route master (0 = tram, 3 = bus)
	 * @type {Number}
	 */

	get type ( ) { return this.#type; }

	/**
	 * An array of Route objects with the routes linked to the route master
	 * @type {Array.<Route>}
	 */

	get routes ( ) { return this.#routes; }

	/**
	 * The osmId of the route master
	 * @type {?Number}
	 */

	get osmId ( ) { return this.#osmId; }

	/**
	 * The osm type of the route master
	 * @type {String}
	 */

	get osmType ( ) { return 'relation'; }

	/**
	 * An object that can be used by JSON.stringify with all the properties of the route master.
	 * @type {Object}
	 */

	get jsonObject ( ) {
		const jsonRouteMaster = {
			description : this.#description,
			ref : this.#ref,
			type : this.#type,
			routes : [],
			osmId : this.#osmId
		};
		this.#routes.forEach (
			route => {
				jsonRouteMaster.routes.push ( route.jsonObject );
			}
		);
		Object.freeze ( jsonRouteMaster.routes );

		return Object.freeze ( jsonRouteMaster );
	}

	/**
	 * Select in the gtfs db all the routes referenced by the route master
	 * @param {Object} network the network in witch the route master is located
	 * @returns {Array.<Object>} An array with all the routes used by the route master
	 */

	async #selectRoutesFromDb ( network ) {

		const { default : theMySqlDb } = await import ( '../Gtfs2Json/MySqlDb.js' );

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
					'WHERE routes.agency_id = "' + network.gtfsAgencyId + '" ' +
					'AND routes.route_id like "' + network.gtfsIdPrefix + '%"' +
					'AND routes.route_short_name ="' + this.#ref + '" ' +
					'AND routes.route_long_name = "' + this.#description + '" ' +
				')  t ' +
				'GROUP BY ' +
				'shapePk ' +
				'ORDER BY startDate,endDate;'
		);

		return dbRoutes;
	}

	/**
	 * Complete the route master object with the routes from the json file
	 * @param {Object} jsonRouteMaster the routeMaster from the json file
	 */

	buildFromJson ( jsonRouteMaster ) {
		this.#osmId = jsonRouteMaster.osmId;
		for ( const jsonRoute of jsonRouteMaster.routes ) {
			const gtfsRoute = new Route ( jsonRoute );
			gtfsRoute.buildFromJson ( jsonRoute );
			this.routes.push ( gtfsRoute );
		}
	}

	/**
	 * Complete the route master object with the routes from the gtfs db
	 * @param {Object} network the network in witch the route master is located
	 */

	async buildFromDb ( network ) {
		const dbRoutes = await this.#selectRoutesFromDb ( network );
		for ( const dbRoute of dbRoutes ) {
			const gtfsRoute = new Route ( dbRoute );
			await gtfsRoute.buildFromDb ( network );
			this.#routes.push ( gtfsRoute );
		}
	}

	/**
	 * The constructor
	 * @param {Object} dbRouteMaster an object with the values of the route master coming from the gtfs db
	 */

	constructor ( dbRouteMaster ) {
		Object.freeze ( this );
		this.#description = dbRouteMaster.description;
		this.#ref = dbRouteMaster.ref;
		this.#type = Number.parseInt ( dbRouteMaster.type );
	}
}

export default RouteMaster;

/* --- End of file --------------------------------------------------------------------------------------------------------- */