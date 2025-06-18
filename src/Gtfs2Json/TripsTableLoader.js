/*
Copyright - 2023 - wwwouaiebe - Contact: https://www.ouaie.be/

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

import TableLoader from '../Gtfs2Json/TableLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Loader for the 'trips' table
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class TripsTableLoader extends TableLoader {

	/**
     * The name of the table
     * @type {string}
     */

	get tableName ( ) { return 'trips'; }

	/**
     * The cosntructor
     */

	constructor ( ) {
		super ( );
		this.fieldsMap.set (
			'trip_pk',
			{
				name : 'trip_pk',
				type : 'int',
				primary : true
			}
		);
		this.fieldsMap.set (
			'trip_id',
			{
				name : 'trip_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				collate : 'utf8mb4_0900_as_cs',
				index : true
			}
		);
		this.fieldsMap.set (
			'route_pk',
			{
				name : 'route_pk',
				type : 'int',
				index : true
			}
		);
		this.fieldsMap.set (
			'route_id',
			{
				name : 'route_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				collate : 'utf8mb4_0900_as_cs',
				index : true
			}
		);
		this.fieldsMap.set (
			'service_pk',
			{
				name : 'service_pk',
				type : 'int',
				index : true
			}
		);
		this.fieldsMap.set (
			'service_id',
			{
				name : 'service_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				collate : 'utf8mb4_0900_as_cs',
				index : true
			}
		);
		this.fieldsMap.set (
			'trip_headsign',
			{
				name : 'trip_headsign',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'trip_short_name',
			{
				name : 'trip_short_name',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'direction_id',
			{
				name : 'direction_id',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'block_id',
			{
				name : 'block_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'shape_pk',
			{
				name : 'shape_pk',
				type : 'int',
				index : true
			}
		);
		this.fieldsMap.set (
			'shape_id',
			{
				name : 'shape_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				collate : 'utf8mb4_0900_as_cs',
				index : true
			}
		);
		this.fieldsMap.set (
			'wheelchair_accessible',
			{
				name : 'wheelchair_accessible',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'bikes_allowed',
			{
				name : 'bikes_allowed',
				type : 'integer'
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

export default TripsTableLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */