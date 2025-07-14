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

import theRelationsReport from '../Reports/RelationsReport.js';
import theStatsReport from '../Reports/StatsReport.js';
import theOperator from '../../Common/Operator.js';
import OsmContinuousRouteValidator from './OsmContinuousRouteValidator.js';
import OsmNameFromToRefValidator from './OsmNameFromToRefValidator.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Validator for a route
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmRouteValidator {

	/**
	 * The route currently validated
	 * @type {Route}
	 */

	#route;

	/**
	 * A flag indicating that the route master have errors
	 * @type {boolean}
	 */

	#haveErrors = false;

	/**
	 * Verify that the route don't have a fixme
	 */

	#validateFixme ( ) {
		const fixme = this.#route.fixme;
		if ( fixme ) {
			theRelationsReport.addWarning ( 'p', 'Warning R019: A fixme exists for this route:' + fixme );
			theStatsReport.addRouteWarningFixme ( );
		}
	}

	/**
	 * Verify that the route master have an operator tag including the current operator
	 */

	#validateOperator ( ) {
		const operator = this.#route.operator;
		if ( ! operator ) {
			theRelationsReport.addError (
				'p',
				'Error R022: Oprator tag not found (expected to be "' + theOperator.osmOperator + '")'
			);
			theStatsReport.addRouteErrorOperator ( );
			this.#haveErrors = true;
		}
		else if ( -1 === operator.split ( ';' ).indexOf ( theOperator.operator ) ) {
			theRelationsReport.addError (
				'p',
				'Error R023: Missing operator ( expected containing "' +
				theOperator.operator +
				'" but found "' + this.#route.operator + '")'
			);
			theStatsReport.addRouteMasterErrorOperator ( );
			this.#haveErrors = true;
		}
	}

	/**
	 * Validation of a route
	 * @param {Route} route the route to validate
	 */

	validate ( route ) {
		this.#route = route;
		theRelationsReport.add ( 'h3', 'Validation of tags, roles and members for route' );
		this.#validateOperator ( );
		this.#validateFixme ( );
		this.#haveErrors = new OsmContinuousRouteValidator ( this.#route ).validate ( ) || this.#haveErrors;
		this.#haveErrors = new OsmNameFromToRefValidator ( this.#route ).validate ( ) || this.#haveErrors;
		if ( ( ! this.#haveErrors ) ) {
			theRelationsReport.add ( 'p', 'No validation errors found for route' );
		}
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default OsmRouteValidator;