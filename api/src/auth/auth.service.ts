import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { loginResponseType } from './types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRespository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginData: AuthDto): Promise<loginResponseType> {
    return this.usersRespository
      .findOneOrFail({
        where: [{ username: loginData.login }, { email: loginData.login }],
      })
      .then(async (user) => {
        const passwordMatch = await compare(loginData.password, user.password);
        if (!passwordMatch)
          throw new UnauthorizedException('Invalid Credentials');
        const accessToken = await this.jwtService.signAsync(
          { sub: user.id },
          { expiresIn: '1h' },
        );
        const refreshToken = await this.jwtService.signAsync(
          { sub: user.id },
          { expiresIn: '30d' },
        );
        return { ...user, accessToken, refreshToken };
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid Credentials');
      });
  }
}
