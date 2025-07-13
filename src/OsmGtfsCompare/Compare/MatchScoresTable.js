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

import theOsmPlatforms from '../DataLoading/OsmPlatforms.js';
import MatchScoreValues from './MatchScoreValues.js';

/**
 * Simple container for a matchScore value of a gtfs route
 */

class MatchScore {

	/**
	 * theShapePk of the gtfs route
	 * @type {Number}
	 */

	shapePk = 0;

	/**
	 * the matchScore value for the concerned gtfs route
	 * @type {Number}
	 */

	matchScore = 0;

	/**
	 * The constructor
	 * @param {Number} shapePk the shapePk of the gtfs route
	 * @param {MatchScoreValues} matchScore the matchScore value
	 */

	constructor ( shapePk, matchScore ) {
		this.shapePk = shapePk;
		this.matchScore = matchScore;
		Object.freeze ( this );
	}
}

/**
 *  A simple container for the MatchScore objects of an osm route
 */

class MatchScores {

	/**
	 * An array with the MatchScore
	 * @type {Array.<MatchScore>}
	 */

	#matchScores = [];

	/**
	 * The osmId of the osm route
	 * @type {Number}
	 */

	#osmId;

	/**
	 * The osmId of the osm route
	 * @type {Number}
	 */

	get osmId ( ) { return this.#osmId; }

	/**
	 * get the list of MatchScores filtererd by a MatchScoreValue
	 * @param {MatchScoreValues} matchScoreValue the value used to filter
	 * @returns {Array.<MatchScore>} the filterd list
	 */

	filter ( matchScoreValue ) {
		return this.#matchScores.filter (
			element => matchScoreValue === element.matchScore
		);
	}

	/**
	 * Freeze the MatchScore list
	 */

	freeze ( ) { Object.freeze ( this.#matchScores ); }

	/**
	 * Add a matchScore to the array
	 * @param {MatchScore} matchScore The MatchScore to add
	 */

	addMatchScore ( matchScore ) {
		this.#matchScores.push ( matchScore );
	}

	/**
	 * The constructor
	 * @param {Number} osmId the osmId of the osm route
	 */

	constructor ( osmId ) {

		this.#osmId = osmId;
		Object.freeze ( this );
	}
}

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * This class:
 * do a comparison between the list of platforms of all the routes of a gtfs route master and an osm route master
 * For each couple of osm route and gtfs route a score is given, depending of of the result of the platforms list comparison
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class MatchScoresTable {

	/**
	 * A table that stores the comparison scores for the routes
	 * @type {Object}
	 */

	#matchScoresTable = {};

	/**
	 * A list of the shapePk of the gtfs routes that have matched with an osm route
	 * @type {Array.<Number>}
	 */

	#matchedGtfsRoutes = new Map ( );

	/**
	 * A list of the shapePk of the gtfs routes that have matched with an osm route
	 * @type {Array.<Number>}
	 */

	get matchedGtfsRoutes ( ) { return this.#matchedGtfsRoutes; }

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
		// so it's possible that firstPlatformRref and secondPlatformRef are different, but pointing to
		// the same osm object
		const firstPlatformOsmId = theOsmPlatforms.getPlatform ( firstPlatformRef )?.osmId;
		const secondPlatformOsmId = theOsmPlatforms.getPlatform ( secondPlatformRef )?.osmId;

		// return true when the two objects have the same osm id
		return firstPlatformOsmId && secondPlatformOsmId && firstPlatformOsmId === secondPlatformOsmId;
	}

	/**
	 * Compare an osm route and a gtfs route platforms refs and returns true when the two routes have the same platforms refs
	 * @param {Route} osmRoute the osm route to compare
	 * @param {Route} gtfsRoute the gtfs route to compare
	 * @returns {boolean} true when the two routes have the same platforms in the same order
	 */

	#haveSamePlatforms ( osmRoute, gtfsRoute ) {
		let haveSamePlatforms = osmRoute.platforms.toString ( ) === gtfsRoute.platforms.toString ( );
		if ( ! haveSamePlatforms ) {

			// not the same platforms... but we have also to verify that the list don't contains platforms
			// with more than one ref on the osm side
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

	#haveSameFromToPlatforms ( osmRoute, gtfsRoute ) {
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
	 * Compare an osm route and a gtfs route refs and returns true when the two routes have similar first
	 * and last platforms refs
	 * 2 platforms are similar when the platforms refs differs only by the last char (probably only usefull for TEC)
	 * @param {Route} osmRoute the osm route to compare
	 * @param {Route} gtfsRoute the gtfs route to compare
	 * @returns {boolean} true when the two routes have the same first and last platforms
	 */

	#haveSimilarFromToPlatforms ( osmRoute, gtfsRoute ) {
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
			this.#matchedGtfsRoutes.set ( gtfsRoute.shapePk, gtfsRoute.shapePk );
			return MatchScoreValues.haveSamePlatforms;
		}
		if ( this.#haveSameFromToPlatforms ( osmRoute, gtfsRoute ) ) {
			this.#matchedGtfsRoutes.set ( gtfsRoute.shapePk, gtfsRoute.shapePk );
			return MatchScoreValues.haveSameFromToPlatforms;
		}
		if ( this.#haveSimilarFromToPlatforms ( osmRoute, gtfsRoute ) )	{
			this.#matchedGtfsRoutes.set ( gtfsRoute.shapePk, gtfsRoute.shapePk );
			return MatchScoreValues.haveSimilarFromToPlatforms;
		}

		return MatchScoreValues.haveDifferentPlatforms;
	}

	/**
	 * Get the matchScores of an osm route that have a haveSamePlatforms value
	 * @param {Route} osmRoute the osm route
	 * @returns {<Array.MatchScores} the searched MatchScores
	 */

	getMatchScoresSamePlatforms ( osmRoute ) {
		return this.#matchScoresTable [ osmRoute.osmId ].filter ( MatchScoreValues.haveSamePlatforms );
	}

	/**
	 * Get the matchScores of an osm route that have a haveSameFromToPlatforms value
	 * @param {Route} osmRoute the osm route
	 * @returns {<Array.MatchScores} the searched MatchScores
	 */

	getMatchScoresSameFromEndPlatforms ( osmRoute ) {
		return this.#matchScoresTable [ osmRoute.osmId ].filter ( MatchScoreValues.haveSameFromToPlatforms );
	}

	/**
	 * Get the matchScores of an osm route that have a haveSimilarFromToPlatforms value
	 * @param {Route} osmRoute the osm route
	 * @returns {<Array.MatchScores} the searched MatchScores
	 */

	getMatchScoresSimilarFromEndPlatforms ( osmRoute ) {
		return this.#matchScoresTable [ osmRoute.osmId ].filter ( MatchScoreValues.haveSimilarFromToPlatforms );
	}

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

	/**
	 * Build the table for a given gtfs route master an a given osm route master
	 * @param {RouteMaster} gtfsRouteMaster the gtfs route master
	 * @param {RouteMaster} osmRouteMaster the osm route master
	 */

	build ( gtfsRouteMaster, osmRouteMaster ) {
		osmRouteMaster.routes.forEach (
			osmRoute => {
				const matchScores = new MatchScores ( osmRoute.osmId );
				gtfsRouteMaster.routes.forEach (
					gtfsRoute => {
						matchScores.addMatchScore (
							new MatchScore ( gtfsRoute.shapePk, this.#computeMatchScore ( osmRoute, gtfsRoute ) )
						);
					}
				);
				matchScores.freeze ( );
				this.#matchScoresTable [ osmRoute.osmId ] = matchScores;
			}
		);
		Object.freeze ( this.#matchScoresTable );
		Object.freeze ( this.#matchedGtfsRoutes );
	}
}

export default MatchScoresTable;

/* --- End of file --------------------------------------------------------------------------------------------------------- */