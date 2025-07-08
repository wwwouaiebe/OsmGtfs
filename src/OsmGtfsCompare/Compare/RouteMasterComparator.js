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

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Route_master comparator. Compare a GTFS route_master with an OSM route_master
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RouteMasterComparator {

	#matchScoresTable = {};

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

	#isSamePlatform ( firstPlatformRef, secondPlatformRef ) {
		if ( firstPlatformRef === secondPlatformRef ) {
			return true
		}
		const firstPlatformOsmId = theOsmPlatforms.getPlatform ( firstPlatformRef )?.id;
		const secondPlatformOsmId = theOsmPlatforms.getPlatform ( secondPlatformRef )?.id;
		return firstPlatformOsmId && secondPlatformOsmId && firstPlatformOsmId === secondPlatformOsmId;
	}

	#areEqual ( osmRoute, gtfsRoute ) {
		let areEqual = osmRoute.platforms.toString ( ) === gtfsRoute.platforms.toString ( );
		if (! areEqual ) {
			if ( osmRoute.platforms.length === gtfsRoute.platforms.length ) {
				areEqual = true;
				for (let platformsCounter = 0; platformsCounter < osmRoute.platforms.length; platformsCounter ++ ) {
					areEqual &= this.#isSamePlatform ( 
						gtfsRoute.platforms [ platformsCounter], 
						gtfsRoute.platforms [ platformsCounter ] 
					);
				}
			}
		}

		return areEqual;
	}

	#haveSameFromEndPlatforms ( osmRoute, gtfsRoute ){
		return ( 
			this.#isSamePlatform ( osmRoute.platforms [ 0 ], gtfsRoute.platforms [ 0 ] )
			&&
			this.#isSamePlatform (
				osmRoute.platforms [ osmRoute.platforms.length - 1 ],
				gtfsRoute.platforms [ gtfsRoute.platforms.length - 1 ]
			)
		);
	}

	#areSimilar ( first, second ) {
		return first.substring ( first.length -1, 0 ) === second.substring ( second.length - 1, 0 );
	}

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

	#computeMatchScore ( osmRoute, gtfsRoute ){
		if ( this.#areEqual ( osmRoute, gtfsRoute ) ) {
			return 3;
		}
		if ( this.#haveSameFromEndPlatforms ( osmRoute, gtfsRoute ) ) {
			return 2;
		}
		if ( this.#haveSimilarFromEndPlatforms (osmRoute, gtfsRoute ) )	{
			return 1;
		}

		return 0;

	}

	#buildMatchScoresTable (  ) {
		this.#osmRouteMaster.routes.forEach (
			osmRoute => {
				this.#matchScoresTable [ osmRoute.osmId ] = {};
				this.#matchScoresTable [ osmRoute.osmId ].scores = {};
				this.#gtfsRouteMaster.routes.forEach (
					gtfsRoute => {
						this.#matchScoresTable [ osmRoute.osmId ].scores [ gtfsRoute.shapePk] =
							this.#computeMatchScore  (osmRoute, gtfsRoute);
					}
				);
			}
		);
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

				theRelationsReport.add ( 'h3', 'GTFS comparison results for route' );
				
				const matchScores = Object.entries ( this.#matchScoresTable [ osmRoute.osmId ] );
				console.log ( matchScores );
				// starting to compare the platforms
				// this.#comparePlatformsHight ( osmRoute );
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
			theRelationsReport.add (
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