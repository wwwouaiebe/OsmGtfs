/*
Copyright - 2024 - wwwouaiebe - Contact: https://www.ouaie.be/

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

import fs from 'fs';

import theMySqlDb from '../Gtfs2Json/MySqlDb.js';
import theOperator from '../Common/Operator.js';

/**
 * Create files with all the platforms information needed for OsmGtfsCompare
 */

class GtfsPlatformsBuilder {

	/**
	 * Build a gtfsPlatforms json file with the platforms informations from GTFS
	 * @param {String} network The network for witch the file is build
	 */

	async build ( network ) {

		let sqlString = 'SELECT stop_id, stop_name, stop_lat, stop_lon, zone_id, platform_type';
		for ( const tmpNetwork of theOperator.networks ) {
			sqlString += ', route_ref_' + tmpNetwork.osmNetwork;
		}
		sqlString += ' FROM stops WHERE route_ref_' + network.osmNetwork + ' is not null ORDER BY stop_id;';

		const stops = await theMySqlDb.execSql ( sqlString );

		console.info ( 'Creating json data for platforms of network bus ' + network.osmNetwork );

		fs.writeFileSync (
			'./json/gtfsPlatforms-' + network.osmNetwork + '.json',
			JSON.stringify ( stops, null, 4 )
		);

	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default GtfsPlatformsBuilder;

/* --- End of file --------------------------------------------------------------------------------------------------------- */