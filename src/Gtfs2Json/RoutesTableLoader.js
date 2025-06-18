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
 * Loader for the 'routes' table
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RouteTableLoader extends TableLoader {

	/**
     * The name of the table
     * @type {string}
     */

	get tableName ( ) { return 'routes'; }

	/**
     * The cosntructor
     */

	constructor ( ) {
		super ( );
		this.fieldsMap.set (
			'route_pk',
			{
				name : 'route_pk',
				type : 'int',
				primary : true
			}
		);
		this.fieldsMap.set (
			'route_id',
			{
				name : 'route_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				index : true,
				collate : 'utf8mb4_0900_as_cs'
			}
		);
		this.fieldsMap.set (
			'agency_pk',
			{
				name : 'agency_pk',
				type : 'int',
				index : true
			}
		);
		this.fieldsMap.set (
			'agency_id',
			{
				name : 'agency_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				index : true,
				collate : 'utf8mb4_0900_as_cs'
			}
		);
		this.fieldsMap.set (
			'route_short_name',
			{
				name : 'route_short_name',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'route_long_name',
			{
				name : 'route_long_name',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'route_desc',
			{
				name : 'route_desc',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'route_type',
			{
				name : 'route_type',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'route_url',
			{
				name : 'route_url',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'route_color',
			{
				name : 'route_color',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'route_text_color',
			{
				name : 'route_text_color',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'route_sort_order',
			{
				name : 'route_sort_order',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'continuous_pickup',
			{
				name : 'continuous_pickup',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'continuous_drop_off',
			{
				name : 'continuous_drop_off',
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

export default RouteTableLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */