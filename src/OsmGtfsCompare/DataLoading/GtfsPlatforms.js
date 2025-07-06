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

import theOperator from '../../Common/Operator.js';
import theDocConfig from '../interface/DocConfig.js';
import Platform from './Platform.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Coming soon
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GtfsPlatforms {

	/**
	 * A js map with the gtfs platforms. The keys are the gtfs stop_id
	 * @type {Map}
	 */

	#platforms = new Map ( );

	/**
	 * A js map with the gtfs platforms. The keys are the gtfs stop_id
	 * @type {Map}
	 */

	get platforms ( ) { return this.#platforms; }

	/**
	 * Get a gtfs platform
	 * @param {String} platformRef the platform ref
	 * @returns {?Object} the asked gtfs platform
	 */

	getPlatform ( platformRef ) {
		return this.#platforms.get ( platformRef );
	}

	/**
	 * load the data coming from the gtfs json file
	 * @param {Array.<Object>} jsonPlatforms
	 */

	loadData ( jsonPlatforms ) {

		this.#platforms.clear ( );
		let platformProperties = {};
		jsonPlatforms.forEach (
			jsonPlatform => {
				platformProperties.type = jsonPlatform.type;
				platformProperties.lat = jsonPlatform.lat;
				platformProperties.lon = jsonPlatform.lon;
				platformProperties.nameOperator = jsonPlatform.nameOperator;
				platformProperties.network = jsonPlatform.network;
				platformProperties.operator = theOperator.operator;
				platformProperties.zone = jsonPlatform.zone;

				platformProperties.routeRefs = {};
				theOperator.networks.forEach (
					network => {
						const routeRef = jsonPlatform [ 'routeRef_' + network.osmNetwork ];
						if ( routeRef ) {
							platformProperties.routeRefs [ network.osmNetwork ] = routeRef;
						}
					}
				);
				platformProperties.gtfsRef = jsonPlatform.gtfsRef;
				if ( jsonPlatform.type === theDocConfig.gtfsType ) {
					this.#platforms.set ( jsonPlatform.gtfsRef, new Platform ( platformProperties ) );
				}
			}
		);
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
		Object.freeze ( this.#platforms );
	}

}

/**
 * The one and only one object GtfsPlatforms
 */

const theGtfsPlatforms = new GtfsPlatforms ( );

export default theGtfsPlatforms;

/* --- End of file --------------------------------------------------------------------------------------------------------- */