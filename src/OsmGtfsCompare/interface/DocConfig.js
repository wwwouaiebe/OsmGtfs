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

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Simple container for values in the the html form
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class DocConfig {

	/**
	 * The operator
	 * @type {String}
	 */

	#operator;

	/**
     * The network
     * @type {String}
     */

	#network = '';

	/**
     * the vehicle
     * @type {String}
     */

	#vehicle = '';

	/**
     * the type
     * @type {String}
     */

	#type = '';

	/**
     * the ref
     * @type {String}
     */

	#ref = '';

	/**
	 * The operator
	 * @type {String}
	 */

	get operator ( ) { return this.#operator; }

	/**
     * the network
     * @type {String}
     */

	get network ( ) { return this.#network; }

	/**
     * the vehicle
     * @type {String}
     */

	get vehicle ( ) { return this.#vehicle; }

	/**
     * the type
     * @type {String}
     */

	get type ( ) { return this.#type; }

	/**
	 * Get the gtfs type for the selected vehicle ( 0 = tram, 1=subway, 3 = bus...)
	 * @type {Number}
	 */

	#gtfsType;

	/**
	 * Get the gtfs type for the selected vehicle ( 0 = tram, 1=subway, 3 = bus...)
	 * @type {Number}
	 */

	get gtfsType ( ) {
		return this.#gtfsType;
	}

	/**
     * the ref
     * @type {String}
     */

	get ref ( ) { return this.#ref; }

	/**
     * Load the data from the html form
     */

	loadData ( ) {
		this.#operator = document.getElementById ( 'osmOperatorSelect' ).value;
		this.#network = document.getElementById ( 'osmNetworkSelect' ).value;
		this.#vehicle = document.getElementById ( 'osmVehicleSelect' ).value;
		this.#type = document.getElementById ( 'osmTypeSelect' ).value;
		this.#ref = document.getElementById ( 'osmRef' ).value;
		switch ( this.#vehicle ) {
		case 'tram' :
			this.#gtfsType = 0;
			break;
		case 'subway' :
			this.#gtfsType = 1;
			break;
		case 'bus' :
			this.#gtfsType = 3;
			break;
		default :
			break;
		}

	}

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}
}

/**
 * The one and only one object DocConfig
 * @type {DocConfig}
 */

const theDocConfig = new DocConfig ( );

export default theDocConfig;

/* --- End of file --------------------------------------------------------------------------------------------------------- */