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

import process from 'process';

import theConfig from '../Gtfs2Json/Config.js';
import theMySqlDb from '../Gtfs2Json/MySqlDb.js';

import theOperator from '../Common/Operator.js';
import GtfsJsonDataBuilder from '../Gtfs2Json/GtfsJsonDataBuilder.js';
import GtfsLoader from '../Gtfs2Json/GtfsLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Start the app:
 * - read and validate the arguments
 * - set the config
 * - remove the old files if any
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class AppLoader {

	/**
     * The version number
     * @type {String}
     */

	static get #version ( ) { return 'v1.0.0'; }

	/**
	* Complete theConfig object from the app parameters
	* @param {?Object} options The options for the app
	 */

	#createConfig ( options ) {

		if ( options ) {
		}
		else {
			process.argv.forEach (
				arg => {
					const argContent = arg.split ( '=' );
					switch ( argContent [ 0 ] ) {
					case '--operatorFile' :
						theConfig.operatorFile = argContent [ 1 ] || '';
						break;
					case '--version' :
						console.error ( `\n\t\x1b[36mVersion : ${AppLoader.#version}\x1b[0m\n` );
						process.exit ( 0 );
						break;
					default :
						break;
					}
				}
			);
		}

		// the config is now frozen
		Object.freeze ( theConfig );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * Load the app, searching all the needed infos to run the app correctly
	 * @param {?Object} options The options for the app
	 */

	async loadApp ( options ) {

		// config
		this.#createConfig ( options );

		await theOperator.loadData ( theConfig.operatorFile );

		console.info ( '\nStarting gtfs2json ...\n\n' );

		await theMySqlDb.start ( );

		const startTime = process.hrtime.bigint ( );

		await new GtfsLoader ( ).start ( );

		for ( const network of theOperator.networks ) {
			await new GtfsJsonDataBuilder ( ).build ( network );
		}

		await theMySqlDb.end ( );

		// end of the process
		const deltaTime = process.hrtime.bigint ( ) - startTime;

		/* eslint-disable-next-line no-magic-numbers */
		const execTime = String ( deltaTime / 1000000000n ) + '.' + String ( deltaTime % 1000000000n ).substring ( 0, 3 );

		console.info ( `\nFiles generated in ${execTime} seconds.` );

		console.info ( '\ngtfs2mysql2json ended...\n\n' );

	}

}

export default AppLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */