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

import theOperator from '../Common/Operator.js';
import TableLoader from '../Gtfs2Json/TableLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Loader for the 'stops' table
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class StopsTableLoader extends TableLoader {

	/**
     * The name of the table
     * @type {string}
     */

	get tableName ( ) { return 'stops'; }

	/**
     * The cosntructor
     */

	constructor ( ) {
		super ( );
		this.fieldsMap.set (
			'stop_pk',
			{
				name : 'stop_pk',
				type : 'int',
				primary : true
			}
		);
		this.fieldsMap.set (
			'stop_id',
			{
				name : 'stop_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				index : true,
				collate : 'utf8mb4_0900_as_cs'
			}
		);
		this.fieldsMap.set (
			'stop_code',
			{
				name : 'stop_code',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'stop_name',
			{
				name : 'stop_name',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'stop_desc',
			{
				name : 'stop_desc',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'stop_lat',
			{
				name : 'stop_lat',
				type : 'decimal',
				length : '9,6'
			}
		);
		this.fieldsMap.set (
			'stop_lon',
			{
				name : 'stop_lon',
				type : 'decimal',
				length : '9,6'
			}
		);

		this.fieldsMap.set (
			'zone_id',
			{
				name : 'zone_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'stop_url',
			{
				name : 'stop_url',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'location_type',
			{
				name : 'location_type',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'parent_station',
			{
				name : 'parent_station',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'stop_timezone',
			{
				name : 'stop_timezone',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'wheelchair_boarding',
			{
				name : 'wheelchair_boarding',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'level_id',
			{
				name : 'level_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'platform_code',
			{
				name : 'platform_code',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'platform_type',
			{
				name : 'platform_type',
				type : 'integer'
			}
		);

		theOperator.networks.forEach (
			network => {
				this.fieldsMap.set (
					'route_ref_' + network.osmNetwork,
					{
						name : 'route_ref_' + network.osmNetwork,
						type : 'varchar',
						length : TableLoader.VARCHAR_LENGHT_256
					}
				);
			}
		);

		this.fieldsMap.set (
			'network',
			{
				name : 'network',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);

		Object.freeze ( this );
	}

	/**
     * Creation of the indexes
     */

	async createIndexes ( ) {
	}

}

export default StopsTableLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */