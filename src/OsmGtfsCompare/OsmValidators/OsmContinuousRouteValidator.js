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
Doc reviewed 20250124
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import theOsmDataLoader from '../DataLoading/OsmDataLoader.js';
import theRelationsReport from '../Reports/RelationsReport.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Validator for a continuous route
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmContinuousRouteValidator {

	/**
     * A counter for the errors
     * @type {Number}
     */

	#haveErrors = false;

	/**
	 * The route currently controlled
	 * @type {Object}
	 */

	#osmRoute;

	/**
	* Verify that a way is circular (= same node for the first and last node)
	 @param {Object} way to verify
	 @returns {boolean} True when the way is circular
	 */

	#wayIsRoundabout ( way ) {
		return way.nodes [ 0 ] === way.nodes.toReversed ( ) [ 0 ];
	}

	/**
	 * Verify that two ways are sharing a node at the beginning or at the end
	 * @param {Object} firstWay The first way to verify
	 * @param {Object} secondWay The second way to verify
	 */

	 #waysHaveCommonNode ( firstWay, secondWay ) {
		return secondWay.nodes [ 0 ] === firstWay.nodes [ 0 ] ||
		secondWay.nodes [ 0 ] === firstWay.nodes.toReversed ( ) [ 0 ] ||
		secondWay.nodes.toReversed ( ) [ 0 ] === firstWay.nodes [ 0 ] ||
		secondWay.nodes.toReversed ( ) [ 0 ] === firstWay.nodes.toReversed ( ) [ 0 ];
	}

	/**
	 * Verify that for two ways:
	 * - one way is circular (= same node for the first and last node)
	 * - the other way have the start node or end node shared with the circular way
	 * @returns {boolean} True when a node is shared between the two ways
	 * @param {Object} firstWay the first way to test
	 * @param {Object} secondWay the second way to test
	 */

	 #waysViaRoundabout ( firstWay, secondWay ) {
		if ( this.#wayIsRoundabout ( firstWay ) ) {
			return -1 !== firstWay.nodes.indexOf ( secondWay.nodes [ 0 ] ) ||
				-1 !== firstWay.nodes.indexOf ( secondWay.nodes.toReversed ( ) [ 0 ] );
		}
		else if ( this.#wayIsRoundabout ( secondWay ) ) {
			return -1 !== secondWay.nodes.indexOf ( firstWay.nodes [ 0 ] ) ||
				-1 !== secondWay.nodes.indexOf ( firstWay.nodes.toReversed ( ) [ 0 ] );
		}
		return false;
	}

	/**
	* Verify that the ways of the route are continuous
	 */

	validate ( ) {
		let previousWay = null;
		this.#osmRoute.members.forEach (
			member => {
				const way = theOsmDataLoader.getWay ( member.ref );
				if ( '' !== member.role || ! way ) {
					return;
				}
				if ( previousWay ) {
					if (
						! this.#waysHaveCommonNode ( way, previousWay )
						&&
						! this.#waysViaRoundabout ( way, previousWay )
					) {
						theRelationsReport.add (
							'p',
							'Error R001: hole found for route ' + theRelationsReport.getOsmLink ( this.#osmRoute ) +
                            ' between way id ' + theRelationsReport.getOsmLink ( previousWay ) +
                            ' and way id ' + theRelationsReport.getOsmLink ( way )
						);
						this.#haveErrors = true;
						previousWay = null;
					}
				}
				previousWay = way;
			}
		);
		return this.#haveErrors;
	}

	/**
	 * The constructor
	 * @param {Object} osmRoute The controlled route
	 */

	constructor ( osmRoute ) {
		this.#osmRoute = osmRoute;
		Object.freeze ( this );
	}
}

export default OsmContinuousRouteValidator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */