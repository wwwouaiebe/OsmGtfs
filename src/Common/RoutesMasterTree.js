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
import ArrayHelper from '../Common/ArrayHelper.js';
import theDocConfig from '../OsmGtfsCompare/Interface/DocConfig.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Coming soon
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RoutesMasterTree {

	/**
	 * An array with the RouteMaster
	 * @type {Array.<RouteMaster>}
	 */

	#routesMaster = [];

	/**
	 * An array with the RouteMaster
	 * @type {Array.<RouteMaster>}
	 */

	get routesMaster ( ) { return this.#routesMaster; };

	/**
	 * An object that can be used by JSON.stringify with all the routes master of the network.
	 * @type {Object}
	 */

	get jsonObject ( ) {
		const jsonRoutesMasterTree = { routesMaster : [] };
		this.#routesMaster.forEach (
			routeMaster => {
				jsonRoutesMasterTree.routesMaster.push ( routeMaster.jsonObject );
			}
		);
		Object.freeze ( jsonRoutesMasterTree.routesMaster );

		return Object.freeze ( jsonRoutesMasterTree );
	}

	/**
	 * Select in the gtfs db all the routes master in the network
	 * @param {Object} network the network for witch the routes master are searched
	 * @returns {Array.<Object>} An array with all the routes master in the network
	 */

	async #selectRoutesMasterFromDb ( network ) {

		const { default : theMySqlDb } = await import ( '../Gtfs2Json/MySqlDb.js' );

		// searching the data in the database
		const dbRoutesMaster = await theMySqlDb.execSql (
			'SELECT DISTINCT ' +
			'routes.route_short_name AS ref, ' +
			'routes.route_long_name AS description, ' +
			'routes.route_type as type ' +
			'FROM routes ' +
            'WHERE routes.agency_id = "' + network.gtfsAgencyId +
			'" AND routes.route_id like "' + network.gtfsIdPrefix + '%";'
		);

		// sorting the routes. Not possible to use an 'order by' sql statement because the sort is a mix
		// of numeric and alphanumeric
		dbRoutesMaster.sort ( ( first, second ) => ArrayHelper.compareRouteName ( first.ref, second.ref ) );
		return dbRoutesMaster;
	}

	/**
	 * Complete the route master tree object with the routes master from the json file
	 * @param {Object} jsonRoutesMasterTree the routes master tree from the json file
	 */

	buildFromJson ( jsonRoutesMasterTree ) {
		this.#routesMaster = [];
		for ( const jsonRouteMaster of jsonRoutesMasterTree.routesMaster ) {
			if ( jsonRouteMaster.type === theDocConfig.gtfsType ) {
				this.#routesMaster.push ( new RouteMaster ( ).buildFromJson ( jsonRouteMaster ) );
			}
		}

		return this;
	}

	/**
	 * Complete the route master tree object with the routes master from the gtfs db
	 * @param {Object} network the network for witch the routes master are searched
	 */

	async buildFromDb ( network ) {
		this.#routesMaster = [];
		const dbRoutesMaster = await this.#selectRoutesMasterFromDb ( network );
		for ( const dbRouteMaster of dbRoutesMaster ) {
			console.info ( 'now building route master ' +
				network.osmNetwork + ' ' +
				dbRouteMaster.ref + ' ' +
				dbRouteMaster.description );
			this.#routesMaster.push ( await new RouteMaster ( ).buildFromDb ( dbRouteMaster, network ) );
		}

		return this;
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

}

export default RoutesMasterTree;

/* --- End of file --------------------------------------------------------------------------------------------------------- */