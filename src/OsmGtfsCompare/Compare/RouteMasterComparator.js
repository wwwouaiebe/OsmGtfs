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

import theRelationsReport from '../../OsmGtfsCompare/Reports/RelationsReport.js';
import OsmRouteValidator from '../../OsmGtfsCompare/OsmValidators/OsmRouteValidator.js';
import theOsmPlatforms from '../../OsmGtfsCompare/DataLoading/OsmPlatforms.js';
import theGtfsPlatforms from '../../OsmGtfsCompare/DataLoading/GtfsPlatforms.js';
import theStatsReport from '../../OsmGtfsCompare/Reports/StatsReport.js';
import MatchScoresTable from '../../OsmGtfsCompare/Compare/MatchScoresTable.js';
import MatchScoreValues from '../../OsmGtfsCompare//Compare/MatchScoreValues.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Route_master comparator. Compare a GTFS route_master with an OSM route_master
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RouteMasterComparator {

   	/**
	 * The compared GTFS route_master
	 * @type {Object}
	 */

	#gtfsRouteMaster;

	/**
	 * The compared OSM route_master
	 * @type {Object}
	 */

	#osmRouteMaster;

	/**
	 * The match scores table to use
	 * @type {MatchScoresTable}
	 */

	#matchScoresTable;

	/**
	 * get an array with all the platforms ref of an osm platform
	 * @param {String} osmPlatform one of the ref of the platform
	 * @returns {Array.<String>} the list of refs
	 */

	#getOsmPlatformRefs ( osmPlatform ) {
		let osmPlatformRefs = [ ];
		const osmRefs = theOsmPlatforms.getPlatform ( osmPlatform )?.osmRefs;
		if ( osmRefs ) {
			Object.values ( osmRefs ).forEach (
				osmRefValue => {
					osmPlatformRefs = osmPlatformRefs.concat ( osmRefValue.split ( ';' ) );
				}
			);
		}
		return osmPlatformRefs;
	}

	/**
	 * Report the osm platforms to remove and the gtfs platforms to add  in an osmRoute
	 * when an osmRoute have differnt platforms than the gtfs route
	 * @param {Route} osmRoute The osm route
	 * @param {Route} gtfsRoute The gtfs route
	 */

	#reportPlatforms ( osmRoute, gtfsRoute ) {

		const osmPlatformsToRemove = [];
		const gtfsPlatformsToAdd = [];

		// Searching the platforms to remove
		osmRoute.platforms.forEach (
			osmPlatform => {
				let platformFound = false;
				 this.#getOsmPlatformRefs ( osmPlatform ).forEach (
					platformRef => { platformFound ||= gtfsRoute.platforms.includes ( platformRef ); }
				);
				if ( ! platformFound ) {
					osmPlatformsToRemove.push ( osmPlatform );
				}
			}
		);

		// Searching the platforms to add
		gtfsRoute.platforms.forEach (
			gtfsPlatform => {
				let platformFound = false;
				this.#getOsmPlatformRefs ( gtfsPlatform ).forEach (
					platformRef => { platformFound ||= osmRoute.platforms.includes ( platformRef ); }
				);
				if ( ! platformFound ) {
					gtfsPlatformsToAdd.push ( gtfsPlatform );
				}
			}
		);

		// Computing a string with the platforms to remove
		let osmPlatformsToRemoveStr = 'Osm platforms to remove: ';
		osmPlatformsToRemove.forEach (
			osmPlatformToRemove => {
				osmPlatformsToRemoveStr +=
					( theOsmPlatforms.getPlatform ( osmPlatformToRemove )?.name ?? '???' ) +
					' (' + osmPlatformToRemove + '),';

			}
		);

		// Computing a string with the platforms to add
		let gtfsPlatformToAddStr = 'gtfs platforms to add: ';
		gtfsPlatformsToAdd.forEach (
			gtfsPlatformToAdd => {
				gtfsPlatformToAddStr +=
				( theGtfsPlatforms.getPlatform ( gtfsPlatformToAdd )?.nameOperator ?? '???' ) +
				' (' + gtfsPlatformToAdd + '),';

			}
		);

		// reporting
		theRelationsReport.addPartial ( 'p', gtfsPlatformToAddStr );
		theRelationsReport.addPartial ( 'p', osmPlatformsToRemoveStr );
 		if (
			0 === osmPlatformsToRemove.length
			&&
			0 === gtfsPlatformsToAdd.length
		) {
			theRelationsReport.addPartial ( 'p', 'Verify the order of the platforms and the duplicate platforms' );
		}
	}

	/**
	 * Get an icon, depending of the start date, end date and match score of a gtfs route
	 * @param {Route} gtfsRoute
	 * @param {Object} matchScore
	 * @returns {String} the searched icon
	 */

	#getRouteIcon ( gtfsRoute, matchScore ) {
		let routeIcon = '🔴';
		if ( matchScore.matchScore === MatchScoreValues.haveSamePlatforms ) {
			routeIcon = '🟢';
		}
		else if ( matchScore.matchScore === MatchScoreValues.haveSameFromToPlatforms ) {
			routeIcon = '🔵';
		}
		else if ( matchScore.matchScore === MatchScoreValues.haveSimilarFromToPlatforms ) {
			routeIcon = '🟡';
		}

		if ( new Date ( gtfsRoute.startDate ).valueOf ( ) > Date.now ( ) ) {
			routeIcon += '⚪';
		}
		else if ( new Date ( gtfsRoute.endDate ).valueOf ( ) < Date.now ( ) ) {
			routeIcon += '⚫'; // †
		}

		return routeIcon;
	}

	/**
	 * Report the results of the gtfs routes comparison for an osm route
	 * @param {Object} matchScores the matchScores of the route
	 * @param {?Route} osmRoute the osm compared route (only needed when the missing platform list is needed)
	 */

	#reportMatchScores ( matchScores, osmRoute ) {
		matchScores.forEach (
			matchScore => {
				const gtfsRoute = this.#gtfsRouteMaster.routes.find ( element => element.shapePk === matchScore.shapePk );
				theRelationsReport.addGpxRoute (
					this.#gtfsRouteMaster,
					gtfsRoute,
					this.#getRouteIcon ( gtfsRoute, matchScore )
				);
				if ( osmRoute ) {
					this.#reportPlatforms (
						osmRoute,
						this.#gtfsRouteMaster.routes.find ( route => route.shapePk === matchScore.shapePk )
					);
				}
			}
		);
	}

	/**
	 * Report the results of the gtfs routes comparison for an osm route with all platforms found
	 * @param {Object} matchScores the matchScores of the route
	 */

	#reportMatchScoresSamePlatforms ( matchScores ) {
		theRelationsReport.add (
			'h3',
			'GTFS comparison results for route: ' +
			(
				1 === matchScores.length
					?
					'a gtfs route with all platforms found'
					:
					'multiple gtfs routes with all platforms found'
			)
		);
		this.#reportMatchScores ( matchScores );
		theStatsReport.addRouteDoneOk ( );
	}

	/**
	 * Report the results of the gtfs routes comparison for an osm route when the fromand end platforms are found
	 * @param {Object} matchScores the matchScores of the route
	 * @param {?Route} osmRoute the osm compared route
	 */

	#reportMatchScoresSameFromEndPlatforms ( matchScores, osmRoute ) {
		theRelationsReport.add (
			'h3',
			'GTFS comparison results for route: ' +
			(
				1 === matchScores.length
					?
					'a gtfs route with from and to platforms found'
					:
					'multiple gtfs routes with from and to platforms found'
			)
		);
		this.#reportMatchScores ( matchScores, osmRoute );
		theStatsReport.addRouteDoneError ( );
	}

	/**
	 * Report the results of the gtfs routes comparison for an osm route when the fromand end platforms are similar
	 *
	 * @param {Object} matchScores the matchScores of the route
	 * @param {?Route} osmRoute the osm compared route
	 */

	#reportMatchScoresSimilarFromEndPlatforms ( matchScores, osmRoute ) {
		theRelationsReport.add (
			'h3',
			'GTFS comparison results for route: ' +
			(
				1 === matchScores.length
					?
					'a gtfs route with similar from and to platforms found'
					:
					'multiple gtfs routes with similar from and to platforms found'
			)
		);
		this.#reportMatchScores ( matchScores, osmRoute );
		theStatsReport.addRouteDoneError ( );
	}

	/**
	 * Compare the routes linked to the route_master
	 */

	#compareRoutes ( ) {

		// loop on the osm routes
		this.#osmRouteMaster.routes.forEach (
			osmRoute => {
 				theRelationsReport.add (
					'h2',
					'Route : ' + osmRoute.name,
					osmRoute

				);

				new OsmRouteValidator ( ).validate ( osmRoute );

				const matchScoresSamePlatforms =
					this.#matchScoresTable.getMatchScoresSamePlatforms ( osmRoute );
				const matchScoresSameFromEndPlatforms =
					this.#matchScoresTable.getMatchScoresSameFromEndPlatforms ( osmRoute );
				const matchScoresSimilarFromEndPlatforms =
					this.#matchScoresTable.getMatchScoresSimilarFromEndPlatforms ( osmRoute );

				if ( 0 !== matchScoresSamePlatforms.length ) {
					this.#reportMatchScoresSamePlatforms ( matchScoresSamePlatforms );
				}
				else if ( 0 !== matchScoresSameFromEndPlatforms.length ) {
					this.#reportMatchScoresSameFromEndPlatforms ( matchScoresSameFromEndPlatforms, osmRoute );
				}
				else if ( 0 === matchScoresSimilarFromEndPlatforms.length ) {
					theRelationsReport.add ( 'h3', 'GTFS comparison results for route' );
					theRelationsReport.addError ( 'p', '🔴 No gtfs route found' );
					theStatsReport.addRouteDoneNoGtfs ( );
				}
				else {
					this.#reportMatchScoresSimilarFromEndPlatforms ( matchScoresSimilarFromEndPlatforms, osmRoute );
				}
			}
		);
	}

	/**
	 * Compare the route_master description. Route_master description is needed when when multiple
	 * OSM route_master have the same ref
	 */

	#compareRouteMasterDescription ( ) {

		// Needed to remove white spaces due to double white spaces or trailing white spaces on the GTFS side
		if (
			( this.#osmRouteMaster.description ?? '' ).toLowerCase ( ).replaceAll ( ' ', '' )
			!==
			( this.#gtfsRouteMaster.description ?? '' ).toLowerCase ( ).replaceAll ( ' ', '' )
		) {
			theRelationsReport.addError (
				'p',
				'Error M009: the osm description of the route_master is not equal to the GTFS route long name (expected "' +
				this.#gtfsRouteMaster.description + '" but found "' +
				this.#osmRouteMaster.description + '")'

			);
			theStatsReport.addRouteMasterErrorDescription ( );
			return false;
		}
		theRelationsReport.add ( 'p', 'No validation errors found for route_master' );

		return true;
	}

	/**
	 * Add to the report the gtfs routes that don't matches an osm route
	 */

	#reportNotMatchedGtfsRoutes ( ) {
		if ( this.#matchScoresTable.matchedGtfsRoutes.size === this.#gtfsRouteMaster.routes.length ) {
			return;
		}

		theRelationsReport.add ( 'h2', 'gtfs routes not found in the osm data' );
		this.#gtfsRouteMaster.routes.forEach (
			gtfsRoute => {
				if ( ! this.#matchScoresTable.matchedGtfsRoutes.get ( gtfsRoute.shapePk ) ) {
					const gtfsRoutesPartOfOsmRoute = [];
					this.#osmRouteMaster.routes.forEach (
						osmRoute => {
							if ( osmRoute.platforms.toString ( ). match ( gtfsRoute.platforms.toString ( ) ) ) {
								gtfsRoutesPartOfOsmRoute.push ( [ gtfsRoute, osmRoute ] );
							}
						}
					);

					let routeIcon = 0 === gtfsRoutesPartOfOsmRoute.length ? '🔴' : '🟣';
					if ( new Date ( gtfsRoute.startDate ).valueOf ( ) > Date.now ( ) ) {
						routeIcon += '⚪';
					}
					else if ( new Date ( gtfsRoute.endDate ).valueOf ( ) < Date.now ( ) ) {
						routeIcon += '⚫';
					}

					theRelationsReport.addGpxRoute ( this.#gtfsRouteMaster, gtfsRoute, routeIcon );
					gtfsRoutesPartOfOsmRoute.forEach (
						gtfsRoutePart => {
							theRelationsReport.addPartial (
								'p',
								'This route is a part of ' + gtfsRoutePart [ 1 ].name,
								gtfsRoutePart [ 1 ]
							);
						}
					);
				}
			}
		);
	}

	/**
	 * Start the comparison between route_master
	 * @param {RouteMaster} osmRouteMaster The osm route to compare
	 * @param {RouteMaster} gtfsRouteMaster The GTFS route to compare
	 */

	compare ( gtfsRouteMaster, osmRouteMaster ) {

		this.#gtfsRouteMaster = gtfsRouteMaster;
		this.#osmRouteMaster = osmRouteMaster;

		this.#matchScoresTable = new MatchScoresTable ( );

		this.#matchScoresTable.build ( this.#gtfsRouteMaster, osmRouteMaster );

		theRelationsReport.add ( 'h3', 'GTFS comparison results for route_master' );
		this.#compareRouteMasterDescription ( );

		this.#compareRoutes ( );

		this.#reportNotMatchedGtfsRoutes ( );

	}

	/**
     * The constructor
     */

	constructor ( ) {

	}
}

export default RouteMasterComparator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */