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

import theOperator from '../../Common/Operator.js';
import theRelationsReport from '../Reports/RelationsReport.js';
import theDocConfig from '../interface/DocConfig.js';
import theStatsReport from '../Reports/StatsReport.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * validator for the route master tags
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmRouteMasterValidator {

	/**
	 * The route master to validate
	 * @type {RouteMaster}
	 */

	#routeMaster;

	/**
	 * A flag indicating that the route master have errors on tags
	 * @type {boolean}
	 */

	#haveErrors = false;

	/**
	 * verify that the name tag is compliant with the osm rules
	 */

	#validateName ( ) {
		if ( ! this.#routeMaster.name ) {
			theRelationsReport.addError (
				'p',
				'Error M008: no name tag for route_master'
			);
			theStatsReport.addRouteMasterErrorName ( );
			this.#haveErrors = true;
		}
		if ( this.#routeMaster.name && this.#routeMaster.ref ) {
			const vehicle = theDocConfig.vehicle.substring ( 0, 1 ).toUpperCase ( ) +
       			theDocConfig.vehicle.substring ( 1 );
			if ( this.#routeMaster.name !== vehicle + ' ' + this.#routeMaster.ref ) {
				theRelationsReport.addError (
					'p',
					'Error M007: invalid name for route_master (must be ' + vehicle + ' ' + this.#routeMaster.tags.ref + ')'
				);
				theStatsReport.addRouteMasterErrorName ( );
				this.#haveErrors = true;
			}
		}
	}

	/**
	 * Verify that the route_master have a ref tag
	 */

	#validateRefTag ( ) {
		if ( ! this.#routeMaster.ref ) {
			theRelationsReport.addError (
				'p',
				'Error M005: route_master without ref tag '
			);
			theStatsReport.addRouteMasterErrorRefs ( );
			this.#haveErrors = true;
		}
	}

	/**
	 * verify that
	 * - the ref tag is the same on the route_master and on all route members
	 */

	#validateSameRefTag ( ) {
		this.#routeMaster.routes.forEach (
			route => {
				if ( this.#routeMaster.ref !== route.ref ) {
					theRelationsReport.addError (
						'p',
						'Error M006: ref tag of the route master (' + this.#routeMaster.ref +
						') is not the same than the ref tag of the route (' + route.ref + ')'
					);
					theStatsReport.addRouteMasterErrorSameRefs ( );
					this.#haveErrors = true;
				}
			}
		);
	}

	/**
	 * Verify tha the route master don't have a fixme
	 */

	#validateFixme ( ) {
		const fixme = this.#routeMaster.fixme;
		if ( fixme ) {
			theRelationsReport.addWarning ( 'p', 'A fixme exists for this route master:' + fixme );
			theStatsReport.addRouteMasterWarningFixme ( );
		}
	}

	/**
	 * Verify that the route master have a operator tag including the current operator
	 */

	#validateOperator ( ) {
		const operator = this.#routeMaster.operator;
		if ( ! operator ) {
			theRelationsReport.addError ( 'p', 'Error M011: Oprator tag not found' );
			theStatsReport.addRouteMasterErrorOperator ( );
			this.#haveErrors = true;
		}
		else if ( -1 === operator.split ( ';' ).indexOf ( theOperator.operator ) ) {
			theRelationsReport.addError (
				'p',
				'Error M012: Missing operator:' + theOperator.operator
			);
			theStatsReport.addRouteMasterErrorOperator ( );
			this.#haveErrors = true;
		}
	}

	/**
	 * Validate ...
	 * @param {Object} routeMaster
	 */

	validate ( routeMaster ) {
		this.#routeMaster = routeMaster;
		theRelationsReport.add ( 'h3', 'Validation of tags for route master' );

		this.#validateOperator ( );
		this.#validateFixme ( );
		this.#validateRefTag ( );
		this.#validateSameRefTag ( );
		this.#validateName ( );

		if ( ( ! this.#haveErrors ) ) {
			theRelationsReport.add ( 'p', 'No validation errors found for route_master' );
		}
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default OsmRouteMasterValidator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */