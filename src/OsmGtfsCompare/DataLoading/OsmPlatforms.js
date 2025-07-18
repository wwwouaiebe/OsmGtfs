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

import theOperator from '../../Common/Operator.js';
import Platform from '../../OsmGtfsCompare/DataLoading/Platform.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * The osm platforms collection
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmPlatforms {

	/**
	 * A map with the platforms having more than one ref. Key of the map is the osmId
	 * @type {Map}
	 */

	#platformsWithMore1ref = new Map ( );

	/**
	 * A map with the platforms having more than one ref. Key of the map is the osmId
	 * @type {Map}
	 */

	get platformsWithMore1ref ( ) { return this.#platformsWithMore1ref; }

	/**
	 * A js map with the gtfs platforms. The keys are the osm ref
	 * @type {Map}
	 */

	#platforms = new Map ( );

	/**
	 * A js map with the gtfs platforms. The keys are the platform ref
	 * @type {Map}
	 */

	get platforms ( ) { return this.#platforms; }

	/**
	 * Get an osm platform
	 * @param {String} platformRef the platform ref
	 * @returns {?Object} the asked osm platform
	 */

	getPlatform ( platformRef ) {
		return this.#platforms.get ( platformRef );
	}

	/**
	 * Build an object with platform properties needed for the comparison from an osmPlatform
	 * @param {Object} osmPlatform
	 * @returns {Object} the platform properties
	 */

	#buildPlatformProperties ( osmPlatform ) {
		let platformProperties = {};
		if ( osmPlatform?.tags?.bus ) {
			platformProperties.type = 3;
		}
		else if ( osmPlatform?.tags?.tram ) {
			platformProperties.type = 0;
		}
		else if ( osmPlatform?.tags?.subway ) {
			platformProperties.type = 1;
		}
		platformProperties.fixme = osmPlatform?.tags?.fixme;
		platformProperties.lat = osmPlatform.lat;
		platformProperties.lon = osmPlatform.lon;
		platformProperties.name = osmPlatform?.tags?.name;
		platformProperties.nameOperator = osmPlatform?.tags [ 'name:operator:' + theOperator.operator ];
		platformProperties.network = osmPlatform?.tags?.network;
		platformProperties.operator = osmPlatform?.tags?.operator;
		platformProperties.zone = osmPlatform?.tags [ 'zone:' + theOperator.operator ];
		platformProperties.osmId = osmPlatform.id;
		platformProperties.osmType = osmPlatform.type;
		platformProperties.routeRefs = {};
		platformProperties.osmRefs = {};
		theOperator.networks.forEach (
			network => {
				const routeRef = osmPlatform?.tags [ 'route_ref:' + network.osmNetwork ];
				if ( routeRef ) {
					platformProperties.routeRefs [ network.osmNetwork ] = routeRef;
				}
				const osmRef = osmPlatform?.tags [ 'ref:' + network.osmNetwork ];
				if ( osmRef ) {
					platformProperties.osmRefs [ network.osmNetwork ] = osmRef;
				}
			}
		);

		return platformProperties;
	}

	/**
	 * load the data coming from a overpass API request
	 * @param {Array.<OsmObject>} osmPlatforms the platforms to set in the collection
	 */

	loadData ( osmPlatforms ) {

		// cleaning maps
		this.#platforms = new Map ( );
		this.#platformsWithMore1ref = new Map ( );

		// loop on the platforms
		osmPlatforms.forEach (
			osmPlatform => {

				// Building a object literal containing the osm platform properties
				const platformProperties = this.#buildPlatformProperties ( osmPlatform );

				// creating Platforms object, one for each ref in the osm platform
				// and adding to the map
				let refsCounter = 0;
				let newPlatform = null;
				Object.values ( platformProperties.osmRefs ) .forEach (
					refs => {
						refs.split ( ';' ).forEach (
							ref => {
								platformProperties.gtfsRef = ref;
								newPlatform = new Platform ( platformProperties );
								this.#platforms.set ( ref, newPlatform );
								refsCounter ++;
							}
						);
					}
				);
				if ( 1 < refsCounter ) {

					// more than 1 ref in the osm platform
					this.#platformsWithMore1ref.set ( newPlatform.osmId, newPlatform );
				}
			}
		);

		Object.freeze ( this.#platforms );
		Object.freeze ( this.#platformsWithMore1ref );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
	}
}

/**
 * The one and only one object OsmPlatforms
 */

const theOsmPlatforms = new OsmPlatforms ( );

export default theOsmPlatforms;

/* --- End of file --------------------------------------------------------------------------------------------------------- */