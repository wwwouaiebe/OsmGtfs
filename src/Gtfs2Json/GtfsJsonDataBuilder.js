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

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Coming soon
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

import fs from 'fs';

import RoutesMasterTree from '../Common/RoutesMasterTree.js';
import theMySqlDb from '../Gtfs2Json/MySqlDb.js';
import theOperator from '../Common/Operator.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Build all the gtfs data for a network and save it in a json file
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GtfsJsonDataBuilder {

	/**
	 * The validity date of the gffs data
	 * @returns {String} the validity date
	 */

	async #getStartDate ( ) {
		let startDate = await theMySqlDb.execSql ( 'SELECT feed_info.feed_start_date as startDate FROM feed_info LIMIT 1' );

		return startDate [ 0 ]?.startDate;
	}

	/**
	 * Build the routes master tree
	 * @param {Object} network The network for witch the file is buid
	 * @returns {Array.<Object>} An Array that can be used by JSON.stringify with all the routes master of the network.
	 */

	async #buildRoutesMasterTree ( network ) {
   		let routesMasterTree = new RoutesMasterTree ( );
		await routesMasterTree.build ( network );

		return routesMasterTree.jsonObject;
	}

	/**
	 * Build the list of platforms
	 * @param {Object} network The network for witch the platforms are asked. Warning the list
	 * contains also platforms of other networks when a platform is used by multiple networks
	 * @returns {Array.<Object>} An array with the platforms
	 */

	async #buildPlatforms ( network ) {

		let sqlString = 'SELECT stop_id, stop_name, stop_lat, stop_lon, zone_id, platform_type';
		for ( const tmpNetwork of theOperator.networks ) {
			sqlString += ', route_ref_' + tmpNetwork.osmNetwork;
		}
		sqlString += ' FROM stops WHERE route_ref_' + network.osmNetwork + ' is not null ORDER BY stop_id;';
		const platforms = await theMySqlDb.execSql ( sqlString );

		return platforms;
	}

	/**
	 * Build and save the gtfs data
	 * @param {Object} network The network for witch the data are build
	 */

	async build ( network ) {

		const GtfsJsonData = {
			startDate : await this.#getStartDate ( ),
			routeMasterTree : await this.#buildRoutesMasterTree ( network ),
			platforms : await this.#buildPlatforms ( network )

		};

		if ( ! fs.existsSync ( './json/' + theOperator.operator ) ) {
			fs.mkdirSync ( './json/' + theOperator.operator );
		}
		fs.writeFileSync (
			'./json/' + theOperator.operator + '/gtfsData-' + network.osmNetwork + '.json',
			JSON.stringify ( GtfsJsonData ) );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default GtfsJsonDataBuilder;