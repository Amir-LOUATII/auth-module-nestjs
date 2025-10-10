import * as bcrypt from 'bcrypt';
import { AbstractPasswordHasher } from '../interfaces/password-hasher.abstract';

export class BcryptPasswordHasherService extends AbstractPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
