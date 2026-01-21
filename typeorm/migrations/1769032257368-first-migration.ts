import { MigrationInterface, QueryRunner } from 'typeorm'

export class FirstMigration1769032257368 implements MigrationInterface {
  name = 'FirstMigration1769032257368'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "user_name" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920" UNIQUE ("user_name"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "saved_trips" ("id" SERIAL NOT NULL, "trip_id" uuid NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_69e7ad2a23a5f63f7132a0d2582" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dc20bd71cf1dbc9b3bcb28248b" ON "saved_trips" ("trip_id", "user_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "saved_trips" ADD CONSTRAINT "FK_c4757e993a358add7da0ff8d182" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_trips" DROP CONSTRAINT "FK_c4757e993a358add7da0ff8d182"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc20bd71cf1dbc9b3bcb28248b"`,
    )
    await queryRunner.query(`DROP TABLE "saved_trips"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
