import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePasswordTokenNullable1761599577437 implements MigrationInterface {
    name = 'MakePasswordTokenNullable1761599577437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_token" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_token" SET NOT NULL`);
    }

}
