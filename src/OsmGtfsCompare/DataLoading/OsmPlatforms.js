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
import Platform from './Platform.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Coming soon
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmPlatforms {

	/**
	 * A js map with the gtfs platforms. The keys are the osm ref
	 * @type {Map}
	 */

	#platforms = new Map ( );

	/**
	 * A js map with the gtfs platforms. The keys are the osm ref
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
	 * load the data coming from a overpass request
	 * @param {Array.<Object>} osmPlatforms
	 */

	loadData ( osmPlatforms ) {
		this.#platforms.slear ( );
		osmPlatforms.forEach (
			osmPlatform => {
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
				let refs = [];
				theOperator.networks.forEach (
					network => {
						const routeRef = osmPlatform?.tags [ 'route_ref:' + network.osmNetwork ];
						if ( routeRef ) {
							platformProperties.routeRefs [ network.osmNetwork ] = routeRef;
						}
						const ref = osmPlatform?.tags [ 'ref:' + network.osmNetwork ];
						if ( ref ) {
							refs = refs.concat ( ref.split ( ';' ) );
						}
					}
				);
				platformProperties.refs = refs;

				refs.forEach (
					ref => {
						platformProperties.ref = ref;
						this.#platforms.set ( ref, new Platform ( platformProperties ) );
					}
				);
			}
		);
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