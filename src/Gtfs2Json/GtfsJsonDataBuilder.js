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
import RoutesMasterBuilder from './RoutesMasterBuilder.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Build all the gtfs data for a network and save it in a json file
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GtfsJsonDataBuilder {

	/**
	 * A map that store the results before writing to the json files
	 * @type {Map}
	 */

	#GtfsJsonData = new Map ( );

	/**
	 * clear the field route_ref_XXXX in the db before the computing of the route_ref_XXX
	 * @param {Object} network the network that have to be cleared
	 */

	async #clearRoutesRef ( network ) {
		await theMySqlDb.execSql (
			'update stops set route_ref_' + network.osmNetwork + ' = "";'
		);
	}

	/**
	 * Update the route_ref_XXX field in the db for all stops linked to a route master
	 * @param {Object} network the updated network
	 * @param {Object} routeMaster the route master
	 */

	async #updatePlatforms4RouteMaster ( network, routeMaster ) {
		const platforms = new Map ( );
		routeMaster.routes.forEach (
			route => {
				route.platforms.forEach (
					platform => {
						platforms.set ( platform, platform );
					}
				);
			}
		);

		for ( const platform of platforms ) {
			const sqlString =
				'UPDATE stops set route_ref_' + network.osmNetwork +
                   ' = CONCAT ( route_ref_' + network.osmNetwork + ', "' + routeMaster.ref + ';" ), platform_type = ' +
				   routeMaster.type + ' where stop_id = "' +
                platform [ 0 ] + '";';
			await theMySqlDb.execSql ( sqlString );
		}
	}

	/**
	 * Update the route_ref_XXX field for an entire network
	 * @param {Object} network
	 * @param {Object} routesMasterTree
	 */

	async #upDateRouteRefFields ( network, routesMasterTree ) {
		this.#clearRoutesRef ( network );
		for ( const routeMaster of routesMasterTree.routesMaster ) {
			await this.#updatePlatforms4RouteMaster ( network, routeMaster );
		}
	}

	/**
	 * Build the routes master tree
	 * @param {Object} network The network for witch the file is buid
	 * @returns {Array.<Object>} An Array that can be used by JSON.stringify with all the routes master of the network.
	 */

	async #buildRoutesMasterTree ( network ) {
		console.info ( 'Now building routes master tree for network ' + network.osmNetwork );

   		const routesMasterTree = new RoutesMasterTree ( );

		routesMasterTree.setRoutesMaster (
			await new RoutesMasterBuilder ( ).build ( network )
		);

		this.#GtfsJsonData.get ( network.osmNetwork ).routesMasterTree = routesMasterTree.jsonObject;

		return routesMasterTree;
	}

	/**
	 * Build the list of platforms
	 * @param {Object} network The network for witch the platforms are asked. Warning the list
	 * contains also platforms of other networks when a platform is used by multiple networks
	 * @returns {Array.<Object>} An array with the platforms
	 */

	async #buildPlatforms ( network ) {

		/*
        UPDATE stops set route_ref_TECL = concat ( route_ref_TECL, "25;") where stop_id = "Baegd741";
        SELECT SUBSTRING(route_ref_tecl,1,LENGTH ( route_ref_tecl ) - 1) from stops where stop_id = "Baegd741";
	    */

		console.info ( 'Now building platforms list ' + network.osmNetwork );

		let sqlString = 'SELECT stop_id as gtfsRef, stop_name AS nameOperator, stop_lat AS lat, stop_lon AS lon,' +
		' zone_id AS zone, platform_type AS type, ' +
		'SUBSTRING( network, 1, LENGTH ( network) -1) AS network';
		for ( const tmpNetwork of theOperator.networks ) {
			sqlString += ', SUBSTRING(route_ref_' + tmpNetwork.osmNetwork + ',1,LENGTH ( route_ref_' +
			tmpNetwork.osmNetwork + ' ) - 1)  AS routeRef_' + tmpNetwork.osmNetwork;
		}
		sqlString += ' FROM stops WHERE route_ref_' + network.osmNetwork + ' <> "" ORDER BY nameOperator;';
		const platforms = await theMySqlDb.execSql ( sqlString );

		this.#GtfsJsonData.get ( network.osmNetwork ).platforms = platforms;
	}

	/**
	 * Update of the network field
	 * @param {Object} network the network
	 */

	async #updateNetworkField ( network ) {

		await theMySqlDb.execSql (
			'UPDATE stops set network = CONCAT ( network, "' + network.osmNetwork + ';") where ' +
			'route_ref_' + network.osmNetwork + ' <> "";'
		);
	}

	/**
	 * Write the json file for a network
	 * @param {Object} network the network
	 */

	async #writeFile ( network ) {

		if ( ! fs.existsSync ( theOperator.jsonDirectory ) ) {
			fs.mkdirSync ( theOperator.jsonDirectory );
		}
		fs.writeFileSync (
			theOperator.jsonDirectory + '/gtfsData-' + network.osmNetwork + '.json',
			JSON.stringify ( this.#GtfsJsonData.get ( network.osmNetwork ) )
		);
	}

	/**
	 * Start the build of the json files
	 */

	async build ( ) {

		const startDateRecord = await theMySqlDb.execSql (
			'SELECT feed_info.feed_start_date as startDate FROM feed_info LIMIT 1'
		);

		for ( const network of theOperator.networks ) {
			this.#GtfsJsonData.set (
				network.osmNetwork,
				{
					startDate : startDateRecord [ 0 ]?.startDate,
					routesMasterTree : null,
					platforms : null
				}
			);
		}

		await theMySqlDb.execSql ( 'update stops set network = "";' );

		for ( const network of theOperator.networks ) {
			const routesMasterTree = await this.#buildRoutesMasterTree ( network );

			await this.#upDateRouteRefFields ( network, routesMasterTree );
		}

		for ( const network of theOperator.networks ) {
			await this.#updateNetworkField ( network );
		}

		for ( const network of theOperator.networks ) {
			await this.#buildPlatforms ( network );
		}

		for ( const network of theOperator.networks ) {
			await this.#writeFile ( network );
		}

	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default GtfsJsonDataBuilder;