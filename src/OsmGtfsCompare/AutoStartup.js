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

import theOperator from '../Common/Operator.js';
import ValidationAndComparisonStarter from '../OsmGtfsCompare/ValidationAndComparisonStarter.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * automatic startup. Read and validate the urp parameters and start the app if everything ok
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class AutoStartup {

	/**
	 * the operator given in the url
	 * @type {?String}
	 */

	#operator = null;

	/**
	 * the network given in the url
	 * @type {?String}
	 */

	#network = null;

	/**
	 * the vehicle given in the url
	 * @type {?String}
	 */

	#vehicle = null;

	/**
	 * the type given in the url
	 * @type {?String}
	 */

	#type = null;

	/**
	 * the autostartup given in the url
	 * @type {?String}
	 */

	#autoStartup = null;

	/**
	 * This method read the url parameters
	 */

	#readUrlParams ( ) {

		const docURL = new URL ( window.location );
		this.#operator = docURL.searchParams.get ( 'operator' ) || 'TEC';
		this.#network = docURL.searchParams.get ( 'network' ) || 'TECL';
		this.#vehicle = docURL.searchParams.get ( 'vehicle' ) || 'bus';
		this.#type = docURL.searchParams.get ( 'type' ) || 'used';
		this.#autoStartup = docURL.searchParams.get ( 'autostartup' );

		this.#operator = this.#operator.toUpperCase ( );
		this.#network = this.#network.toUpperCase ( );
		this.#vehicle = this.#vehicle.toLowerCase ( );
		this.#type = this.#type.toLowerCase ( );
	}

	/**
	 * This method validate the operator given in the url parameters
	 * An operator is valid when a valid json file named as the operator is found in the operators folder
	 * @returns {boolean} true when the operator is valid, false otherwise
	 */

	async #validateOperator ( ) {

		// Loading data from the json operator file
		// stop and alert the user in case of bad operator given in the parameters
		if ( ! ( await theOperator.loadData ( this.#operator ) ) ) {
			alert ( 'Unknown operator parameter ' + this.#operator );
			return false;
		}

		return true;
	}

	/**
	 * This method validate the network given in the url parameters
	 * A network is valid when present in the networks list of the operator
	 * @returns {boolean} true when the network is valid, false otherwise
	 */

	#validateNetwork ( ) {

		// stop if no network given in the parameters
		if ( ! this.#network ) {
			if ( null !== this.#autoStartup ) {
				alert ( 'Autostartup is enabled but the "network" url parameter is not present' );
			}
			return false;
		}

		// stop and alert the user if a bad network is given in the parameters
		if ( ! theOperator.networks.find ( network => this.#network === network.osmNetwork ) ) {
			alert ( 'Unknown network parameter: ' + this.#network );
			return false;
		}

		return true;
	}

	/**
	 * This method validate the vehicle given in the url parameters
	 * A vehicle is valid when the valus is 'bus', 'tram' or 'subway'
	 * @returns {boolean} true when the vehicle is valid, false otherwise
	 */

	#validateVehicle ( ) {

		// stop if no vehicle given in the parameters
		if ( ! this.#vehicle ) {
			if ( null !== this.#autoStartup ) {
				alert ( 'Autostartup is enabled but the "vehicle" url parameter is not present' );
			}
			return false;
		}

		// stop and alert the user if a bad vehicle is given in the parameters
		if ( -1 === [ 'bus', 'tram', 'subway' ].indexOf ( this.#vehicle ) ) {
			alert ( 'bad value for vehicle parameter : "' + this.#vehicle + '". Must be "bus", "tram" or "subway"' );
			return false;
		}

		return true;
	}

	/**
	 * This method validate the type given in the url parameters
	 * A vehicle is valid when the valus is 'used', 'proposed', 'disused'
	 * @returns {boolean} true when the vehicle is valid, false otherwise
	 */

	#validateType ( ) {

		// stop if no type type given in the parameters
		if ( ! this.#type ) {
			if ( null !== this.#autoStartup ) {
				alert ( 'Autostartup is enabled but the "type" url parameter is not present' );
			}
			return false;
		}

		// stop and alert the user if a bad type is given in the parameters
		if ( -1 === [ 'used', 'proposed', 'disused' ].indexOf ( this.#type ) ) {
			alert ( 'bad value for type parameter : "' + this.#type + '". Must be bus "used", "proposed" or "disused"' );
			return false;
		}

		return true;
	}

	/**
	 * This method complete the network select html element with the networks
	 */

	#completeNetworkSelect ( ) {

		// loading networks from the operator json file in the select html element
		const osmNetworkSelectElement = document.getElementById ( 'osmNetworkSelect' );
		theOperator.networks.forEach (
			network => {
				const optionElement = document.createElement ( 'option' );
				optionElement.text = network.osmNetwork;
				osmNetworkSelectElement.appendChild ( optionElement );
			}
		);
	}

	/**
	 *  This method select the network given in the url params within the network select html element
	 */

	#selectNetwork ( ) {

		document.getElementById ( 'osmNetworkSelect' ).value = this.#network;
	}

	/**
	 *  This method select the vehicle and type  given in the url params within the vehicle and type select html element
	 */

	#selectVehicleAndType ( ) {
		document.getElementById ( 'osmVehicleSelect' ).value = this.#vehicle;
		document.getElementById ( 'osmTypeSelect' ).value = this.#type;
	}

	/**
     * Read and verify the url parameters, complete the form with the parameters and start the control
     */

	async start ( ) {

		this.#readUrlParams ( );

		if ( await this.#validateOperator ( ) ) {
			this.#completeNetworkSelect ( );
		}
		else {
			return;
		}

		if ( this.#validateNetwork ( ) ) {
			this.#selectNetwork ( );
		}

		if ( ! this.#validateVehicle ( ) ) {
			return;
		}

		if ( ! this.#validateType ( ) ) {
			return;
		}

		this.#selectVehicleAndType ( );

		// auto startup. Reminder that a value is not needed for the autostartup, only the presence of a parameter!
		if ( null !== this.#autoStartup ) {
			new ValidationAndComparisonStarter ( ).start ( );
		}
	}

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default AutoStartup;

/* --- End of file --------------------------------------------------------------------------------------------------------- */