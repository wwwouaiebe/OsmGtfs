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
import theStatsReport from '../../OsmGtfsCompare/Reports/StatsReport.js';
import theDocConfig from '../../OsmGtfsCompare/interface/DocConfig.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Validator for a continuous route
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmContinuousRouteValidator {

	/**
     * A flag for the errors on ways
     * @type {boolean}
     */

	#haveErrorsWays = false;

	/**
     * A flag for the errors on holes
     * @type {boolean}
     */

	#haveErrorsHoles = false;

	/**
	 * The route currently controlled
	 * @type {Route}
	 */

	#route;

	/**
	* Verify that a way is circular (= same node for the first and last node)
	 @param {osmWay} way to verify
	 @returns {boolean} True when the way is circular
	 */

	#wayIsRoundabout ( way ) {
		return way.nodes [ 0 ] === way.nodes.toReversed ( ) [ 0 ];
	}

	/**
	 * Verify that two ways are sharing a node at the beginning or at the end
	 * @param {osmWay} firstWay The first way to verify
	 * @param {osmWay} secondWay The second way to verify
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
	 * - the other way have the start node or end node shared on the circular way
	 * @returns {boolean} True when a node is shared between the two ways
	 * @param {osmWay} firstWay the first way to test
	 * @param {osmWay} secondWay the second way to test
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
	 * Verify that a way is a valid way for a bus:
	 * - the highway tag of way is in the validBusHighways array
	 * - or the way have a bus=yes tag or psv=yes tag
	 * @param {Object} way The way to verify
	 */

	#validateWayForBus ( way ) {
		const validBusHighways =
		[
			'motorway',
			'motorway_link',
			'trunk',
			'trunk_link',
			'primary',
			'primary_link',
			'secondary',
			'secondary_link',
			'tertiary',
			'tertiary_link',
			'service',
			'residential',
			'unclassified',
			'living_street',
			'busway',
			'construction'
		];

		if ( 'construction' === way?.tags?.highway ) {
			theRelationsReport.addWarning (
				'p',
				'Warning R017: a road under construction is used as way for the route ',
				{ osmId : way.id, osmType : way.type }
			);
			this.#haveErrorsWays = true;
		}
		if (
			-1 === validBusHighways.indexOf ( way?.tags?.highway )
			&&
			'yes' !== way?.tags?.psv
			&&
			'yes' !== way?.tags [ theDocConfig.vehicle ]
	   ) {
		   theRelationsReport.addError (
				'p',
				'Error R013: an invalid highway is used as way for the route ',
				{ osmId : way?.id, osmType : way?.type }
		   );
		   this.#haveErrorsWays = true;
	   }
	}

	/**
	 * Verify that a way is valid for a tram:
	 * - the way must have a railway=tram tag
	 * @param {Object} way The way to verify
	 */

	#validateWayForTram ( way ) {
		if ( 'tram' !== way?.tags?.railway ) {
			theRelationsReport.add (
				'p',
				'Error R014: an invalid railway is used as way for the route ',
				{ osmId : way.id, osmType : way.type }
			);
			this.#haveErrorsWays = true;
		}

	}

	/**
	 * Verify that a way is valid for a subway:
	 * - the way must have a railway=subway tag
	 * @param {Object} way The way to verify
	 */

	#validateWayForSubway ( way ) {
		if ( 'subway' !== way?.tags?.railway ) {
			theRelationsReport.add (
				'p',
				'Error R014: an invalid railway is used as way for the route ',
				{ osmId : way.id, osmType : way.type }
			);
			this.#haveErrorsWays = true;
		}
	}

	/**
	* Verify that the ways of the route are continuous
	@param {?Object} previousWay the previously controlled way
	@param {Object} way The currently controled way
	 */

	#validateContinuousRoute ( previousWay, way ) {
		if ( previousWay ) {
			if (
				! this.#waysHaveCommonNode ( way, previousWay )
				&&
				! this.#waysViaRoundabout ( way, previousWay )
			) {
				theRelationsReport.addError (
					'p',
					'Error R001: hole found for route ' + theRelationsReport.getOsmLink ( this.#route ) +
					' between way id ' + theRelationsReport.getOsmLink (
						{ osmId : previousWay.id, osmType : previousWay.type }
					) +
					' and way id ' + theRelationsReport.getOsmLink (
						{ osmId : way.id, osmType : way.type }
					)
				);
				this.#haveErrorsHoles = true;
				return false;
			}
		}
		return true;
	}

	/**
	* Verify that the ways of the route are continuous and valid
	 */

	validate ( ) {

		let previousWay = null;

		this.#route.ways.forEach (
			way => {
				if ( ! this.#validateContinuousRoute ( previousWay, way ) ) {
					previousWay = null;
				}
				switch ( theDocConfig.vehicle ) {
				case 'bus' :
					this.#validateWayForBus ( way );
					break;
				case 'tram' :
					this.#validateWayForTram ( way );
					break;
				case 'subway' :
					this.#validateWayForSubway ( way );
					break;
				default :
					break;
				}

				previousWay = way;
			}
		);

		if ( this.#haveErrorsHoles ) {
			theStatsReport.addRouteErrorHoles ( );
		}
		if ( this.#haveErrorsWays ) {
			theStatsReport.addRouteErrorWays ( );
		}

		return this.#haveErrorsWays || this.#haveErrorsHoles;
	}

	/**
	 * The constructor
	 * @param {Route} route The controlled route
	 */

	constructor ( route ) {
		this.#route = route;
		Object.freeze ( this );
	}
}

export default OsmContinuousRouteValidator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */