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
Doc reviewed 20250126
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import theOperator from '../../Common/Operator';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Event handler for change on the operator select on the web page
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OperatorSelectChangeEL {

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * Event handler
	 * @param {Object} changeEvent The triggered event
	 */

	async handleEvent ( changeEvent ) {
		const OperatorName = changeEvent.target.value;
		await theOperator.loadData ( './dataFiles/operators/' + OperatorName + '.json' );
		const osmNetworks = Array.from ( theOperator.networks, element => element.osmNetwork )
			.sort ( ( first, second ) => first.localeCompare ( second ) );

		const networksSelect = document.getElementById ( 'osmNetworkSelect' );
		networksSelect.options.length = 0;
		osmNetworks.forEach (
			osmNetwork => {
				const option = document.createElement ( 'option' );
				option.text = osmNetwork;
				networksSelect.options.add ( option );
			}
		);
	}
}

export default OperatorSelectChangeEL;

/* --- End of file --------------------------------------------------------------------------------------------------------- */