/*
Copyright - 2024 - wwwouaiebe - Contact: https://www.ouaie.be/

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

import fs from 'fs';

import theMySqlDb from '../Gtfs2Json/MySqlDb.js';
import PolylineEncoder from '../Gtfs2Json/PolylineEncoder.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Build a js object with all the necessary GTFS informations for OsmGtfsCompare
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GtfsTreeBuilder {

	/**
     * The network for witch the information is build
     * @type {Object}
     */

	#network;

	/**
     * The object with the GTFS information
     * @type {Object}
     */

	#gtfsTree = {
		startDate : '',
		routesMaster : []
	};

	/**
     * An object used to compress the GTFS data
     * @type {Object}
     */

	#polylineEncoder;

	/**
     * The current GTFS route master (= 1 record in the routes table)
     * @type {Object}
     */

	#currentRouteMaster = {};

	/**
	 * A map with the platforms and routeRef
	 * @type {Map}
	 */

	#platformsRoutesRefMap = new Map ( );

	/**
     * Coming soon
     * @param { String} shapePk Coming soon
     * @returns {String} coming soon
     */

	async #getNodes ( shapePk ) {
		const nodes = await theMySqlDb.execSql (
			'SELECT shapes.shape_pt_lat AS lat, shapes.shape_pt_lon AS lon ' +
            'FROM shapes WHERE shapes.shape_pk = ' + shapePk + ' ' +
            'ORDER BY shapes.shape_pk, shapes.shape_pt_sequence;'
		);

		let nodesArray = [];
		nodes.forEach (
			node => nodesArray.push ( [ Number.parseFloat ( node.lat ), Number.parseFloat ( node.lon ) ] )
		);

		// eslint-disable-next-line no-magic-numbers
		return this.#polylineEncoder.encode ( nodesArray, [ 6, 6 ] );
	}

	/**
     * Coming soon
     * @param {String} shapePk coming soon
     */

	async #selectPlatformsForShape ( shapePk ) {
		const platforms = await theMySqlDb.execSql (
			'SELECT stop_times.stop_sequence AS platformOrder, stops.stop_id AS platformId, stops.stop_name AS platformName, ' +
            'stops.stop_lat AS platformLat ,stops.stop_lon AS platformLon ' +
            'FROM stop_times INNER JOIN stops ON stops.stop_pk = stop_times.stop_pk ' +
            'WHERE stop_times.trip_pk = ' +
            '( SELECT trips.trip_pk FROM trips WHERE trips.shape_pk = ' + shapePk.shapePk + ' LIMIT 1 ) ' +
            'ORDER BY stop_times.stop_sequence;'
		);
		let route = {
			name : '',
			platforms : [],
			from : '',
			to : '',
			platformsString : '',
			nodes : '',
			shapePk : shapePk.shapePk,
			startDate : shapePk.minStartDate,
			endDate : shapePk.maxEndDate,
			osmRouteMaster : false,
			platformNames : null
		};
		let previousPlatformId = '';
		for ( let platformsCounter = 0; platformsCounter < platforms.length; platformsCounter ++ ) {
			let platform = platforms [ platformsCounter ];
			if ( previousPlatformId !== platform.platformId ) {
				route.platforms.push (
					{
						gtfsStopId : platform.platformId,
						id : platform.platformId,
						name : platform.platformName,
						lat : Number.parseFloat ( platform.platformLat ),
						lon : Number.parseFloat ( platform.platformLon )
					}
				);
				previousPlatformId = platform.platformId;
			}
		}
		route.nodes = await this.#getNodes ( shapePk.shapePk );
		this.#currentRouteMaster.routes.push ( route );
	}

	/**
     * Coming soon
     */

	async #selectShapesPkForRouteMaster ( ) {
		const shapesPk = await theMySqlDb.execSql (

			'SELECT ' +
				'min(t.start_date) AS minStartDate,' +
				'max(t.end_date) AS maxEndDate, ' +
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
					'AND routes.route_id like "' + this.#network.idPrefix + '%"' +
					'AND routes.route_short_name ="' + this.#currentRouteMaster.ref + '" ' +
					'AND routes.route_long_name = "' + this.#currentRouteMaster.description + '" ' +
				')  t ' +
				'GROUP BY ' +
				'shapePk ' +
				'ORDER BY minStartDate,maxEndDate;'
		);

		for ( let shapesPkCounter = 0; shapesPkCounter < shapesPk.length; shapesPkCounter ++ ) {

			await this.#selectPlatformsForShape ( shapesPk [ shapesPkCounter ] );
		}
	}

	/**
	 * Compare 2 names for sorting.
	 * Names are splited into a numeric and analphanumric part, the the numeric part is completed with
	 * spaces on the left, then compared as string
	 * @param {String} first The first name to compare
	 * @param {String} second The second name to compare
	 * @returns {Number} The result of the comparison. See String.localCompare ( )
	 */

	#compareRouteName ( first, second ) {

		// split the name into the numeric part and the alphanumeric part:
		// numeric part
		let firstPrefix = String ( Number.parseInt ( first ) );
		let secondPrefix = String ( Number.parseInt ( second ) );

		// alpha numeric part
		let firstPostfix = ( first ).replace ( firstPrefix, '' );
		let secondPostfix = ( second ).replace ( secondPrefix, '' );

		// complete the numeric part with spaces on the left and compare
		let result =
			( firstPrefix.padStart ( 5, ' ' ) + firstPostfix )
				.localeCompare ( secondPrefix.padStart ( 5, ' ' ) + secondPostfix );

		return result;
	}

	/**
     * Select the routes in the GTFS data and buid the GTFS data for each route
     */

	async #selectRoutesMaster ( ) {

		// searching the data in the database
		let routesMaster = await theMySqlDb.execSql (
			'SELECT DISTINCT ' +
			'routes.route_short_name AS routeMasterRef, ' +
			'routes.route_long_name AS routeMasterDescription, ' +
			'routes.route_type as routeMasterType ' +
			'FROM routes ' +
            'WHERE routes.agency_id = "' + this.#network.gtfsAgencyId +
			'" AND routes.route_id like "' + this.#network.idPrefix + '%";'
		);

		// sorting the routes
		routesMaster.sort ( ( first, second ) => this.#compareRouteName ( first.routeMasterRef, second.routeMasterRef ) );

		// loop on the routes
		for ( let routesMasterCounter = 0; routesMasterCounter < routesMaster.length; routesMasterCounter ++ ) {

			// Start building an object with GTFS data for the route
			this.#currentRouteMaster = {
				description : routesMaster [ routesMasterCounter ].routeMasterDescription,
				ref : routesMaster [ routesMasterCounter ].routeMasterRef,
				type : Number.parseInt ( routesMaster [ routesMasterCounter ].routeMasterType ),
				routes : [],
				osmRouteMaster : null
			};

			// Adding the differents trips of the route
			await this.#selectShapesPkForRouteMaster ( );

			// Saving data
			this.#gtfsTree.routesMaster.push ( this.#currentRouteMaster );

			// User info
			console.info (
				'Creating json data for bus ' +
				this.#currentRouteMaster.ref +
				' of network ' + this.#network.osmNetwork
			);
		}
	}

	/**
     * Coming soon
     */

	#removeDuplicateRoutes ( ) {
		this.#gtfsTree.routesMaster.forEach (
			routeMaster => {
				let routesMap = new Map ( );
				routeMaster.routes.forEach (
					route => {
						let platformKey = '';
						route.platforms.forEach (
							platform => {
								platformKey += platform.id;
							}
						);
						let routeKey = platformKey + route.nodes;
						if ( ! routesMap.get ( routeKey ) ) {
							routesMap.set ( routeKey, route );
						}
					}
				);
				routeMaster.routes = [];

				routesMap.forEach (
					route => { routeMaster.routes.push ( route ); }
				);

			}
		);
	}

	/**
     * Coming soon
     * @returns {String} Coming soon
     */

	async #getStartDate ( ) {
		let startDate = await theMySqlDb.execSql ( 'SELECT feed_info.feed_start_date as startDate FROM feed_info LIMIT 1' );
		if ( 0 < startDate.length && startDate [ 0 ].startDate ) {
		    return startDate [ 0 ].startDate;
		}
		return '???';
	}

	/**
	 * Save the collection of platforms and routeRef to a file.
	 */

	async #savePlatformsRoutesRefMap ( ) {
		let platformsRoutesRefArray = [];
		this.#platformsRoutesRefMap.forEach (
			platformRoutesRef => {
				let routesRefArray = [];
				platformRoutesRef.routesRef.forEach (
					routeRef => {
						routesRefArray.push ( routeRef );
					}
				);
				routesRefArray.sort ( this.#compareRouteName );
				let routesRefString = '';
				routesRefArray.forEach (
					routeRef => {
						routesRefString += routeRef + ';';
					}
				);
				platformsRoutesRefArray.push (
					{
						platformId : platformRoutesRef.platformId,
						routesRef : routesRefString.slice ( 0, -1 ),
						type : platformRoutesRef.type
					}
				);
			}
		);
		platformsRoutesRefArray.sort (
			( first, second ) => first.platformId.localeCompare ( second.platformId )
		);

		/*
		ALTER TABLE `stops` ADD `route_ref_TECB` VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
		NULL DEFAULT NULL AFTER `route_ref_TECL`, ADD `route_ref_TECC` VARCHAR(256) CHARACTER SET
		utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL AFTER `route_ref_TECB`, ADD `route_ref_TECH`
		VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL AFTER `route_ref_TECC`,
		ADD `route_ref_TECN` VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL AFTER
		`route_ref_TECH`, ADD `route_ref_TECX` VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL
		DEFAULT NULL AFTER `route_ref_TECN`;
		*/

		for ( const platformRouteRef of platformsRoutesRefArray ) {
			await theMySqlDb.execSql (
				'update stops set route_ref_' + this.#network.osmNetwork +
				' =  "' + platformRouteRef.routesRef + '", platform_type=' + platformRouteRef.type + ' where stop_id = "' +
				platformRouteRef.platformId + '";'
			);
		}

	}

	/**
	 * Add a routeRef to a bus_stop
	 * @param {String} routeMaster the routeMaster
	 * @param {String} platformId the bus_stop id
	 */

	#addRouteRef ( routeMaster, platformId ) {

		let platformRoutesRef = this.#platformsRoutesRefMap.get ( platformId );
		if ( ! platformRoutesRef ) {
			platformRoutesRef = {
				platformId : platformId,
				routesRef : new Map ( ),
				type : routeMaster.type
			};
			this.#platformsRoutesRefMap.set ( platformId, platformRoutesRef );
		}

		platformRoutesRef.routesRef.set ( routeMaster.ref, routeMaster.ref );
	}

	/**
	 * Build a collection of objects containing, for each bus_stop the routeRef associated
	 */

	async #buildRouteRef ( ) {
		this.#gtfsTree.routesMaster.forEach (
			routeMaster => {
				routeMaster.routes.forEach (
					route => {
						if ( new Date ( route.endDate ).valueOf ( ) > new Date ( '2025-04-28' ).valueOf ( ) ) {
							route.platforms.forEach (
								platform => {
									this.#addRouteRef ( routeMaster, platform.id );
								}
							);
						}
					}
				);
			}
		);
		await this.#savePlatformsRoutesRefMap ( );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		this.#polylineEncoder = new PolylineEncoder ( );
		Object.freeze ( this );
	}

	/**
     * Build an object containing the GTFS data for a network
	 * @param {Object} network An onject as defined in the oprator.json file
     */

	async build ( network ) {
		this.#network = network;
		this.#platformsRoutesRefMap.clear ( );
		this.#gtfsTree.routesMaster = [];
		this.#gtfsTree.startDate = await this.#getStartDate ( );
		await this.#selectRoutesMaster ( );
		this.#removeDuplicateRoutes ( );
		fs.writeFileSync ( './json/gtfsRoutes-' + this.#network.osmNetwork + '.json', JSON.stringify ( this.#gtfsTree ) );
		await this.#buildRouteRef ( );
 	}

}

export default GtfsTreeBuilder;

/* --- End of file --------------------------------------------------------------------------------------------------------- */