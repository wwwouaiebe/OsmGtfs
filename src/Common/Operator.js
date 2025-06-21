
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

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Simple container for storing the contains of the oprator file
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class Operator {

	/**
	 * The contains of the operator file
	 * @type {Object}
	 */

	#jsonOperator = {};

	/**
	 * The name of the mySql db
	 * @type {String}
	 */

	get mySqlDbName ( ) { return this.#jsonOperator.mySqlDbName; }

	/**
	 * the name of the directory where the gfs files are
	 * @type {String}
	 */

	get gtfsDirectory ( ) { return this.#jsonOperator.gtfsDirectory; }

	/**
	 * The name of the operator
	 * @type {String}
	 */

	get operator ( ) { return this.#jsonOperator.operator; }

	/**
	 * The name of the operator as used in OSM
	 * @type {String}
	 */

	get osmOperator ( ) { return this.#jsonOperator.osmOperator; }

	/**
	 * An array with the networks of the operator
	 * @type{Array.<Object>}
	 */

	get networks ( ) { return this.#jsonOperator.networks; }

	/**
	 * Load the contains of the operator file
	 * @param {String} operatorFile The name of the operator file
	 */

	async loadData ( operatorFile ) {

		const jsonOperator = await import ( '../../operators/' + operatorFile, { with : { type : 'json' } } );

		this.#jsonOperator = jsonOperator.default;

		this.networks.forEach (
			network => Object.freeze ( network )
		);
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

}

/**
 * The one and only one object operator
 */

const theOperator = new Operator ( );

export default theOperator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */