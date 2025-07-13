/*
Copyright - 2024 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

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

import theGtfsRoutesMasterTree from '../DataLoading/GtfsRoutesMasterTree.js';
import theOsmRoutesMasterTree from '../DataLoading/OsmRoutesMasterTree.js';
import theRelationsReport from '../Reports/RelationsReport.js';
import OsmRouteMasterValidator from '../OsmValidators/OsmRouteMasterValidator.js';
import theDocConfig from '../interface/DocConfig.js';
import RouteMasterComparator from './RouteMasterComparator.js';
import theStatsReport from '../Reports/StatsReport.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Start the comparison betwwen two routes master trees
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RoutesMasterTreesComparator {

	/**
	 * A list of routes master present in gtfs and not found in osm
	 * @type {Array.<RouteMaster>}
	 */

	#missingOsmRoutesMaster = [];

	/**
	 * A list of osm routes master not found in gtfs
	 * @type {Array.<RouteMaster>}
	 */

	#unknownOsmRoutesMaster = [];

	/**
	 * Search a route master in a route master tree or add it to a list of missing route master when not found
	 * @param {RoutesMasterTree} routeMasterTree The routeMasterTree in witch the search is performed
	 * @param {RouteMaster} routeMaster the route master to search in the tree
	 * @param {Array.>RouteMaster} missingRoutesMaster The list where the 'not found' route master is added
	 * @returns {?RouteMaster} the searched route master or null if not found
	 */

	#searchRouteMaster ( routeMasterTree, routeMaster, missingRoutesMaster ) {

		let searchedRouteMaster = null;

		// serching the route master based on the route master ref
		let searchedRoutesMaster = routeMasterTree.routesMaster.filter ( element => routeMaster.ref === element.ref );

		switch ( searchedRoutesMaster.length ) {
		case 0 :

			// nothing found
			missingRoutesMaster.push ( routeMaster );
			break;
		case 1 :

			// only one route master found
			searchedRouteMaster = searchedRoutesMaster [ 0 ];
			break;
		default :

			// more than one route master found... Searching based on ref and description
			searchedRoutesMaster = routeMasterTree.routesMaster.filter (
				element => {
					const returnValue =
                        routeMaster.ref === element.ref
                        &&
                        element.description
						&&
						routeMaster.description
						&&
                        0 === routeMaster.description.toLowerCase ( ).localeCompare (
                        	element.description.toLowerCase ( )
                        );
					return returnValue;
				}
			);
			if ( 1 === searchedRoutesMaster.length ) {

				// only one route master found
				searchedRouteMaster = searchedRoutesMaster [ 0 ];
			}
			else {

				// nothing found
				missingRoutesMaster.push ( routeMaster );
			}
			break;
		}

		return searchedRouteMaster;
	}

	/**
	 * Compare the gtfs route master tree with the osm route master tree.
	 * All routes master present in the gtfs tree are searched
	 */

	#compareGtfsRoutesMasterTree ( ) {

		// loop on gtfs routes master
		theGtfsRoutesMasterTree.routesMaster.forEach (
			gtfsRouteMaster => {

				// searching the osm route master with same ref and description
				const osmRouteMaster = this.#searchRouteMaster (
					theOsmRoutesMasterTree,
					gtfsRouteMaster,
					this.#missingOsmRoutesMaster
				);
				if ( osmRouteMaster ) {

					// an osm route master is found
					// Add a heading for the route master in the report
					theRelationsReport.add (
						'h1',
						'Route master : ' +
							theDocConfig.vehicle.slice ( 0, 1 ).toUpperCase ( ) + theDocConfig.vehicle.slice ( 1 ) + ' ' +
							( osmRouteMaster.ref ?? '' ) + ' ' +
							( osmRouteMaster.description ?? '' ) + ' ',
						osmRouteMaster
 					);

					// and start the validation of the route master
					new OsmRouteMasterValidator ( ).validate ( osmRouteMaster );

					new RouteMasterComparator ( ).compare ( gtfsRouteMaster, osmRouteMaster );
				}
			}
		);
	}

	/**
	 * Compare the osm route master tree with the gtfs route master tree.
	 * All routes master present in the osm tree are searched
	 */

	#compareOsmRoutesMasterTree ( ) {
		theOsmRoutesMasterTree.routesMaster.forEach (
			osmRouteMaster => {
				this.#searchRouteMaster (
					theGtfsRoutesMasterTree,
					osmRouteMaster,
					this.#unknownOsmRoutesMaster
				);
			}
		);
	}

	/**
	 * Report all the routes master found in the gtfs tree and not found in the osm tree
	 */

	#reportMissingOsmRoutesMaster ( ) {

		// Heading
		theRelationsReport.add ( 'h1', 'gtfs routes master without osm routes master' );
		if ( 0 === this.#missingOsmRoutesMaster.length ) {

			// empty list
			theRelationsReport.add ( 'p', 'nothing found' );
		}
		else {

			// loop on the missing routes master
			this.#missingOsmRoutesMaster.forEach (
				gtfsRouteMaster => {

					// heading
					theRelationsReport.add (
						'h2',
						'gtfs route : ' +
						theDocConfig.vehicle.slice ( 0, 1 ).toUpperCase ( ) + theDocConfig.vehicle.slice ( 1 ) + ' ' +
						gtfsRouteMaster.ref + ' ' + gtfsRouteMaster.description
					);

					// loop on the routes attached to the route master and adding a gpx button to the report
					gtfsRouteMaster.routes.forEach (
						route => {
							theRelationsReport.addGpxRoute ( gtfsRouteMaster, route, '🔴' );
							theStatsReport.addRouteToDo ( );
						}
					);
				}
			);
		}
	}

	/**
	 * Report all the routes master found in the osm tree and not found in the gtfs tree
	 */

	#reportUnknownOsmRoutesMaster ( ) {

		// Heading
		theRelationsReport.add ( 'h1', 'Osm routes master not found in the gtfs data' );
		if ( 0 === this.#unknownOsmRoutesMaster.length ) {

			// empty list
			theRelationsReport.add ( 'p', 'nothing found' );
		}
		else {

			// loop on the missing routes master
			this.#unknownOsmRoutesMaster.forEach (
				unknownOsmRouteMaster => {
					theRelationsReport.add (
						'p',
						( unknownOsmRouteMaster.ref ?? '' ) + ' ' + ( unknownOsmRouteMaster.description ?? '' ),
						unknownOsmRouteMaster
					);
				}
			);
		}
	}

	/**
	 * Start the comparison
	 */

	compare ( ) {
		this.#compareGtfsRoutesMasterTree ( );
		this.#compareOsmRoutesMasterTree ( );

		this.#reportMissingOsmRoutesMaster ( );
		this.#reportUnknownOsmRoutesMaster ( );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

}

export default RoutesMasterTreesComparator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */