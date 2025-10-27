import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetToken1761598970744 implements MigrationInterface {
    name = 'AddPasswordResetToken1761598970744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "password_reset_token" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_reset_token"`);
    }

}
