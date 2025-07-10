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
Doc reviewed 20250126
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import theRelationsReport from '../Reports/RelationsReport.js';
import OsmRouteValidator from '../OsmValidators/OsmRouteValidator.js';
import theOsmPlatforms from '../DataLoading/OsmPlatforms.js';
import theGtfsPlatforms from '../DataLoading/GtfsPlatforms.js';

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
	 * A table that stores the comparison scores for the routes of the current route master
	 * @type {Object}
	 */

	#matchScoresTable = {};

	/**
	 * A static object with scores given to the comparison of platforms for an osm route and a gtfs route
	 * @type {Object}
	 */

	static get #matchScore ( ) {
		return {
			haveSamePlatforms : 3,
			haveSameFromEndPlatforms : 2,
			haveSimilarFromEndPlatforms : 1,
			haveDifferentPlatforms : 0
		};
	}

	/**
	 * Compare 2 osm platforms ref and return true when the 2 refs are attached to the same osm object
	 * @param {String} firstPlatformRef the first platform ref to use
	 * @param {String} secondPlatformRef the second platform ref to use
	 * @returns {boolean} true when the 2 refs are attached to the same object
	 */

	#isSameOsmPlatform ( firstPlatformRef, secondPlatformRef ) {

		// The two platforms have the same ref ... return true
		if ( firstPlatformRef === secondPlatformRef ) {
			return true;
		}

		// Searching the two osm objects having the compared ref
		// Remember that when an osm platform have more than 1 ref, the platform is duplicated,
		// so it's possible that firstPlatformRef and secondPlatformRef are different, but pointing to
		// the same osm object
		const firstPlatformOsmId = theOsmPlatforms.getPlatform ( firstPlatformRef )?.osmId;
		const secondPlatformOsmId = theOsmPlatforms.getPlatform ( secondPlatformRef )?.osmId;

		// return true when the two objects have the same osm id
		return firstPlatformOsmId && secondPlatformOsmId && firstPlatformOsmId === secondPlatformOsmId;
	}

	/**
	 * Compare an osm route and a gtfs route and returns true when the two routes have the same platforms
	 * @param {Route} osmRoute the osm route to compare
	 * @param {Route} gtfsRoute the gtfs route to compare
	 * @returns {boolean} true when the two routes have the same platforms in the same order
	 */

	#haveSamePlatforms ( osmRoute, gtfsRoute ) {
		let haveSamePlatforms = osmRoute.platforms.toString ( ) === gtfsRoute.platforms.toString ( );
		if ( ! haveSamePlatforms ) {
			if ( osmRoute.platforms.length === gtfsRoute.platforms.length ) {
				haveSamePlatforms = true;
				for ( let platformsCounter = 0; platformsCounter < osmRoute.platforms.length; platformsCounter ++ ) {
					haveSamePlatforms = haveSamePlatforms && this.#isSameOsmPlatform (
						osmRoute.platforms [ platformsCounter ],
						gtfsRoute.platforms [ platformsCounter ]
					);
				}
			}
		}

		return haveSamePlatforms;
	}

	/**
	 * Compare an osm route and a gtfs route and returns true when the two routes have the same first and last platforms
	 * @param {Route} osmRoute the osm route to compare
	 * @param {Route} gtfsRoute the gtfs route to compare
	 * @returns {boolean} true when the two routes have the same first and last platforms
	 */

	#haveSameFromEndPlatforms ( osmRoute, gtfsRoute ) {
		return (
			this.#isSameOsmPlatform ( osmRoute.platforms [ 0 ], gtfsRoute.platforms [ 0 ] )
			&&
			this.#isSameOsmPlatform (
				osmRoute.platforms [ osmRoute.platforms.length - 1 ],
				gtfsRoute.platforms [ gtfsRoute.platforms.length - 1 ]
			)
		);
	}

	/**
	 * Compare 2 strings and return true when the strings differs only by the last char
	 * @param {String} first
	 * @param {String} second
	 * @returns {boolean} true when the string are similar
	 */

	#areSimilar ( first, second ) {
		return first.substring ( first.length - 1, 0 ) === second.substring ( second.length - 1, 0 );
	}

	/**
	 * Compare an osm route and a gtfs route and returns true when the two routes have similar first and last platforms refs
	 * 2 platforms are similar when the platforms refs differs only by the last char
	 * @param {Route} osmRoute the osm route to compare
	 * @param {Route} gtfsRoute the gtfs route to compare
	 * @returns {boolean} true when the two routes have the same first and last platforms
	 */

	#haveSimilarFromEndPlatforms ( osmRoute, gtfsRoute ) {
		return (
			this.#areSimilar ( osmRoute.platforms [ 0 ], gtfsRoute.platforms [ 0 ] )
			&&
			this.#areSimilar (
				osmRoute.platforms [ osmRoute.platforms.length - 1 ],
				gtfsRoute.platforms [ gtfsRoute.platforms.length - 1 ]
			)
		);
	}

	/**
	 * Compute the match score betwwen an osm route and a gtfs route
	 * @param {Route} osmRoute the osm route
	 * @param {Route} gtfsRoute thr gtfs route
	 * @returns {number} the result of the comparison
	 */

	#computeMatchScore ( osmRoute, gtfsRoute ) {
		if ( this.#haveSamePlatforms ( osmRoute, gtfsRoute ) ) {
			return RouteMasterComparator.#matchScore.haveSamePlatforms;
		}
		if ( this.#haveSameFromEndPlatforms ( osmRoute, gtfsRoute ) ) {
			return RouteMasterComparator.#matchScore.haveSameFromEndPlatforms;
		}
		if ( this.#haveSimilarFromEndPlatforms ( osmRoute, gtfsRoute ) )	{
			return RouteMasterComparator.#matchScore.haveSimilarFromEndPlatforms;
		}

		return RouteMasterComparator.#matchScore.haveDifferentPlatforms;

	}

	/**
	 * build the match score table for the current route master
	 */

	/*
	Sample of a table:
	{
		osmRouteId1 : {
			matchScores : [
				{
					shapePk : 1234,
					matchScore : 0
				},
				{
					shapePk : 5678,
					matchScore : 0
				},
				...
			]
		},
		osmIdRoute2 : {
			matchScores ...
		},
		...
	}
	*/

	#buildMatchScoresTable ( ) {
		this.#osmRouteMaster.routes.forEach (
			osmRoute => {
				this.#matchScoresTable [ osmRoute.osmId ] = {};
				this.#matchScoresTable [ osmRoute.osmId ].matchScores = [];
				this.#gtfsRouteMaster.routes.forEach (
					gtfsRoute => {
						this.#matchScoresTable [ osmRoute.osmId ].matchScores.push (
							{
								shapePk : gtfsRoute.shapePk,
								matchScore : this.#computeMatchScore ( osmRoute, gtfsRoute )
							}
						);
					}
				);
			}
		);
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
				if ( ! gtfsRoute.platforms.includes ( osmPlatform ) ) {
					osmPlatformsToRemove.push ( osmPlatform );
				}
			}
		);

		// Searching the platforms to add
		gtfsRoute.platforms.forEach (
			gtfsPlatform => {
				if ( ! osmRoute.platforms.includes ( gtfsPlatform ) ) {
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
		theRelationsReport.add ( 'p', osmPlatformsToRemoveStr );
		theRelationsReport.add ( 'p', gtfsPlatformToAddStr );
 		if (
			0 === osmPlatformsToRemove.length
			&&
			0 === gtfsPlatformsToAdd.length
		) {
			theRelationsReport.add ( 'p', 'Verify the order of the platforms and the duplicate platforms' );
		}
	}

	#getRouteIcon ( gtfsRoute, matchScore ) {
		if ( new Date ( gtfsRoute.startDate ).valueOf ( ) > Date.now ( ) ) {
			return '⚪';
		}
		else if ( new Date ( gtfsRoute.endDate ).valueOf ( ) < Date.now ( ) ) {
			return '⚫'; // †
		}
		else if ( matchScore.matchScore === RouteMasterComparator.#matchScore.haveSamePlatforms ) {
			return '🟢';
		}
		else if ( matchScore.matchScore === RouteMasterComparator.#matchScore.haveSameFromEndPlatforms ) {
			return '🔵';
		}
		else if ( matchScore.matchScore === RouteMasterComparator.#matchScore.haveSimilarFromEndPlatforms ) {
			return '🟡';
		}
		return '';
	}

	#reportMatchScores ( matchScores, osmRoute ) {
		matchScores.forEach (
			matchScore => {
				const gtfsRoute = this.#gtfsRouteMaster.routes.find ( route => route.shapePk === matchScore.shapePk );
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
	}

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
	}

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
	}

	/**
	 * Compare the routes linked to the route_master
	 */

	#compareRoutes ( ) {

		this.#buildMatchScoresTable ( );

		// loop on the osm routes
		this.#osmRouteMaster.routes.forEach (
			osmRoute => {
 				theRelationsReport.add (
					'h2',
					osmRoute.name,
					osmRoute

				);

				new OsmRouteValidator ( ).validate ( osmRoute );

				const matchScoresSamePlatforms = this.#matchScoresTable [ osmRoute.osmId ].matchScores.filter (
					element => RouteMasterComparator.#matchScore.haveSamePlatforms === element.matchScore
				);
				const matchScoresSameFromEndPlatforms = this.#matchScoresTable [ osmRoute.osmId ].matchScores.filter (
					 element => RouteMasterComparator.#matchScore.haveSameFromEndPlatforms === element.matchScore
				);
				const matchScoresSimilarFromEndPlatforms = this.#matchScoresTable [ osmRoute.osmId ].matchScores.filter (
					element => RouteMasterComparator.#matchScore.haveSimilarFromEndPlatforms === element.matchScore
				);

				if ( 0 !== matchScoresSamePlatforms.length ) {
					this.#reportMatchScoresSamePlatforms ( matchScoresSamePlatforms );
				}
				else if ( 0 !== matchScoresSameFromEndPlatforms.length ) {
					this.#reportMatchScoresSameFromEndPlatforms ( matchScoresSameFromEndPlatforms, osmRoute );
				}
				else if ( 0 === matchScoresSimilarFromEndPlatforms.length ) {
					theRelationsReport.add ( 'h3', 'GTFS comparison results for route' );
					theRelationsReport.addError ( 'p', '🔴 No gtfs route found' );
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
				'Error C001: the osm description of the route_master ( ' +
				this.#osmRouteMaster.description +
				') is not equal to the GTFS route long name ( ' +
				this.#gtfsRouteMaster.description +
				' )'
			);
			return false;
		}
		theRelationsReport.add ( 'p', 'No validation errors found for route_master' );

		return true;
	}

	/**
	 * Start the comparison between route_master
	 * @param {RouteMaster} osmRouteMaster The osm route to compare
	 * @param {RouteMaster} gtfsRouteMaster The GTFS route to compare
	 */

	compare ( gtfsRouteMaster, osmRouteMaster ) {

		this.#gtfsRouteMaster = gtfsRouteMaster;
		this.#osmRouteMaster = osmRouteMaster;

		theRelationsReport.add ( 'h3', 'GTFS comparison results for route_master' );
		this.#compareRouteMasterDescription ( );

		this.#compareRoutes ( );

		// this.#reportMissingOsmRoutes ( );

	}

	/**
     * The constructor
     */

	constructor ( ) {

	}
}

export default RouteMasterComparator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */