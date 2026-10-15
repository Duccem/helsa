# Database schema rules

The schema of the database is defined in the `packages/db/src/schema` folder. The schema is defined using the [Drizzle ORM](https://orm.drizzle.team/) library. Its recommended to read the [Drizzle ORM documentation](https://orm.drizzle.team/) to understand how to define the schema. The schema is separated into different files for each logic domain. The following rules must be followed when defining the schema:
  
- Each domain must have its own file in the `packages/db/src/schema` folder. The file name must be the name of the domain in lowercase. For example, the `auth` domain must be defined in the `auth.ts` file.
- The schema must be defined using the `pgTable` function from the `drizzle-orm/pg-core` package. The `pgTable` function takes two arguments: the name of the table and a function that defines the columns of the table. The function must return an object where the keys are the names of the columns and the values are the column definitions.
- The column definitions must be defined using the functions from the `drizzle-orm/pg-core` package. The following functions are available:
  - `text`: defines a text column.
  - `boolean`: defines a boolean column.
  - `timestamp`: defines a timestamp column.
  - `index`: defines an index on a column.
  - `primaryKey`: defines a primary key on a column.
  - `unique`: defines a unique constraint on a column.
  - `uuid`: defines a UUID column.
- All the IDs must be deined as text columns with a primary key constraint. The IDs must be generated using the `uuid` function from the `drizzle-orm/pg-core` package and using the v7 function from the `uuid` package. The IDs must be generated with the function `$defaultFn(v7)`.
- Use the `defineRelationsPart` function from the `drizzle-orm` package to define the relations between tables. The `defineRelationsPart` function takes a function that defines the relations between tables. The function must return an object where the keys are the names of the relations and the values are the relation definitions.
- The created_at column should have a default by `now()` and the updated_at should have an `$onUpdated` function that should set the dat eto `new Date()`
- The enums related to the domain should be on the same file as the main table of the domain

## Example

```typescript
export const enum_column = pgEnum("enum_column", ["value1", "value2"])
export const table_one = pgTable(
  "table_one",
  (table) => ({
    id: table.uuid().primaryKey().$defaultFn(v7),
    column: table.text(),
    column_enum: enum_column()
  }),
);

export const table_two = pgTable(
  "table_two",
  (table) => ({
    id: table.uuid().primaryKey().$defaultFn(v7),
    table_one_id: table.uuid().references(() => table_one.id)
    column: table.text(),
  }),
);

export const table_relations = defineRelationsPart(
  { table_one, table_two },
  (r) => ({
    table_one: {
      twos: r.many.table_two({
        from: r.table_one.id,
        to: r.table_two.table_one_id
      })
    },
    table_two: {
      one: r.one.table_one({
        from: r.table_two.table_one_id,
        to: r.table_one.id
      })
    }
  })
)

```