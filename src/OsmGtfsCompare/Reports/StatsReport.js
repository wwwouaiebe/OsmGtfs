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
import Report from './Report.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * The stats report
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class StatsReport extends Report {

	/**
	 * An object with somme properties for storing statistics
	 * @type {HTMLElement}
	 */

	#stats = {
		routesMaster : {
			operator : 0,
			fixme : 0,
			name : 0,
			members : 0,
			refs : 0,
			sameRefs : 0,
			errors : 0,
			warnings : 0,
			fixme : 0
		},
		routes : {
			doneError : 0,
			doneOk : 0,
			toDo : 0,
			validationErrors : 0,
			validationWarnings : 0
		},
		platforms : {
			warnings : 0,
			errors : 0,
			name : 0,
			nameOperator : 0,
			fixme : 0,
			network : 0,
			operator : 0,
			routeRefs : 0,
			zone : 0
		}
	};

	/**
	 * reset the stats
	 */

	#clearStats ( ) {
		Object.keys ( this.#stats.routesMaster ).forEach (
			key => { this.#stats.routesMaster [ key ] = 0; }
		);
		Object.keys ( this.#stats.routes ).forEach (
			key => { this.#stats.routes [ key ] = 0; }
		);
		Object.keys ( this.#stats.platforms ).forEach (
			key => { this.#stats.platforms [ key ] = 0; }
		);
	}

	/**
	 * Increment the routesMaster.errors and routesMaster.sameRefs values of the stats
	 */

	addRouteMasterErrorSameRefs ( ) {
		this.#stats.routesMaster.errors ++;
		this.#stats.routesMaster.sameRefs ++;
	}

	/**
	 * Increment the routesMaster.errors and routesMaster.refs values of the stats
	 */

	addRouteMasterErrorRefs ( ) {
		this.#stats.routesMaster.errors ++;
		this.#stats.routesMaster.refs ++;
	}

	/**
	 * Increment the routesMaster.errors and routesMaster.members values of the stats
	 */

	addRouteMasterErrorMembers ( ) {
		this.#stats.routesMaster.errors ++;
		this.#stats.routesMaster.members ++;
	}

	/**
	 * Increment the routesMaster.errors and routesMaster.name values of the stats
	 */

	addRouteMasterErrorName ( ) {
		this.#stats.routesMaster.errors ++;
		this.#stats.routesMaster.name ++;
	}

	/**
	 * Increment the routesMaster.errors and routesMaster.operator values of the stats
	 */

	addRouteMasterErrorOperator ( ) {
		this.#stats.routesMaster.errors ++;
		this.#stats.routesMaster.operator ++;
	}

	/**
	 * Increment the routesMaster.warnings and routesMaster.fixme values of the stats
	 */

	addRouteMasterWarningFixme ( ) {
		this.#stats.routesMaster.warnings ++;
		this.#stats.routesMaster.fixme ++;
	}

	/**
	 * Increment the doneOk value of the stats
	 */

	addRouteDoneOk ( ) {
		this.#stats.routes.doneOk ++;
	}

	/**
	 * Increment the doneOk value of the stats
	 */

	addRouteDoneError ( ) {
		this.#stats.routes.doneError ++;
	}

	/**
	 * Increment the toDo value of the stats
	 * @param {Number} quantity
	 */

	addRouteToDo ( quantity ) {
		this.#stats.routes.toDo += quantity ? quantity : 1;
	}

	/**
	 * Increment the validationErrors value of the stats
	 */

	addRouteValidationError ( ) {
		this.#stats.routes.validationErrors ++;
	}

	/**
	 * Increment the validationWarnings value of the stats
	 */

	addRouteValidationWarning ( ) {
		this.#stats.routes.validationWarnings ++;
	}

	/**
	 * Increment the platforms.errors and platforms.name values of the stats
	 */

	addPlatformsErrorName ( ) {
		this.#stats.platforms.errors ++;
		this.#stats.platforms.name ++;
	}

	/**
	 * Increment the platforms.errors and platforms.nameOperator values of the stats
	 */

	addPlatformsErrorNameOperator ( ) {
		this.#stats.platforms.errors ++;
		this.#stats.platforms.nameOperator ++;
	}

	/**
	 * Increment the platforms.warnings and platforms.fixme values of the stats
	 */

	addPlatformsWarningFixme ( ) {
		this.#stats.platforms.warnings ++;
		this.#stats.platforms.fixme ++;
	}

	/**
	 * Increment the platforms.errors and platforms.network values of the stats
	 */

	addPlatformsErrorNetwork ( ) {
		this.#stats.platforms.errors ++;
		this.#stats.platforms.network ++;
	}

	/**
	 * Increment the platforms.errors and platforms.operator values of the stats
	 */

	addPlatformsErrorOperator ( ) {
		this.#stats.platforms.errors ++;
		this.#stats.platforms.operator ++;
	}

	/**
	 * Increment the platforms.errors and platforms.name values of the stats
	 */

	addPlatformsErrorRouteRefs ( ) {
		this.#stats.platforms.errors ++;
		this.#stats.platforms.routeRefs ++;
	}

	/**
	 * Increment the platforms.errors and platforms.zone values of the stats
	 */

	addPlatformsErrorZone ( ) {
		this.#stats.platforms.errors ++;
		this.#stats.platforms.zone ++;
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		super ( );
		this.report = document.getElementById ( 'statsPane' );
		Object.freeze ( this );
		Object.seal ( this.#stats );
		Object.seal ( this.#stats.routesMaster );
		Object.seal ( this.#stats.routes );
		Object.seal ( this.#stats.platforms );
	}

	/**
	 * Open the report ( = prepare the report for a new control)
	 */

	open ( ) {

		super.open ( );
		this.#clearStats ( );

	}

	/**
	 * Close the report ( = do some operations at the end of a control)
	 */

	close ( ) {
		this.add ( 'h1', 'Stats :' );
		this.add ( 'h2', 'Routes master' );
		this.add ( 'p', 'Osm routes master with errors on operator: ' + this.#stats.routesMaster.operator );
		this.add ( 'p', 'Osm routes master with fixme: ' + this.#stats.routesMaster.fixme );
		this.add ( 'p', 'Osm routes master with errors on name: ' + this.#stats.routesMaster.name );
		this.add ( 'p', 'Osm routes master with errors on members: ' + this.#stats.routesMaster.members );
		this.add ( 'p', 'Osm routes master with errors on ref: ' + this.#stats.routesMaster.refs );
		this.add ( 'p', 'Osm routes master with refs <> ref on routes: ' + this.#stats.routesMaster.sameRefs );
		this.add ( 'p', 'Validation errors on routes master to fix: ' + this.#stats.routesMaster.errors );
		this.add ( 'p', 'Validation warnings on routes master nice to fix: ' + this.#stats.routesMaster.warnings );
		this.add ( 'h2', 'Routes' );
		this.add ( 'p', 'Osm route relations done and aligned on GTFS files: ' + this.#stats.routes.doneOk );
		this.add ( 'p', 'Osm route relations done but not aligned on GTFS files: ' + this.#stats.routes.doneError );
		this.add ( 'p', 'Osm route relations todo: ' + this.#stats.routes.toDo );
		this.add ( 'p', 'Validation errors on routes to fix: ' + this.#stats.routes.validationErrors );
		this.add ( 'p', 'Validation warnings on routes nice to fix: ' + this.#stats.routes.validationWarnings );
		this.add ( 'h2', 'platforms' );
		this.add ( 'p', 'Osm platforms with errors on name: ' + this.#stats.platforms.name );
		this.add (
			'p',
			'Osm platforms with errors on name:operator: ' + theOperator.operator + ' :' + this.#stats.platforms.nameOperator
		);
		this.add ( 'p', 'Osm platforms with fixme: ' + this.#stats.platforms.fixme );
		this.add ( 'p', 'Osm platforms with errors on operator: ' + this.#stats.platforms.operator );
		this.add ( 'p', 'Osm platforms with errors on network: ' + this.#stats.platforms.network );
		this.add ( 'p', 'Osm platforms with errors on route_ref: ' + this.#stats.platforms.routeRefs );
		this.add ( 'p', 'Osm platforms with errors on zone: ' + this.#stats.platforms.zone );
		this.add ( 'p', 'Validation errors on platforms to fix: ' + this.#stats.platforms.errors );
		this.add ( 'p', 'Validation warnings on platforms nice to fix: ' + this.#stats.platforms.warnings );
	}

}

/**
 * The one and only one object StatsReport
 * @type {StatsReport}
 */

const theStatsReport = new StatsReport;

export default theStatsReport;

/* --- End of file --------------------------------------------------------------------------------------------------------- */