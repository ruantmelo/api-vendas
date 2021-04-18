import { getCustomRepository } from 'typeorm';
import AppError from '../../errors/AppError';
import path from 'path';
import UsersRepository from '../../repositories/UsersRepository';
import UsersTokensRepository from '../../repositories/UsersTokenRepository';
import EtherealMail from '../../config/mail/EtherealMail';

class SendForgotPasswordEmailService {
  async execute(email: string): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository);
    const usersTokensRepository = getCustomRepository(UsersTokensRepository);

    const user = await usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('There is no user with email: ' + email, 404);
    }

    const userToken = await usersTokensRepository.generate(user.id);

    //console.log(userToken);
    const forgotPasswordTemplate = path.resolve(
      __dirname,
      '..',
      '..',
      'views',
      'forgot_password.hbs',
    );
    await EtherealMail.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: 'API Vendas Recuperação de Senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: user.name,
          link: `http://localhost:3000/reset_password?token=${userToken.token}`,
        },
      },
    });
  }
}

export default SendForgotPasswordEmailService;
