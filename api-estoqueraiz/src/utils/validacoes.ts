import { cpf as cpfValidator } from "cpf-cnpj-validator";
import emailValidator from "email-validator";

export function validarCPF(cpf: string): boolean {
  return cpfValidator.isValid(cpf);
}
export function validarEmail(email: string): boolean {
  return emailValidator.validate(email);
}

export function validarSenha(value: string): boolean {
  const senhaFormato = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  return senhaFormato.test(value);
}

export function validarDataNascimento(value: Date): boolean {
  const dataAtual = new Date();
  const dataNascimento = new Date(value);
  const idade = dataAtual.getFullYear() - dataNascimento.getFullYear();
  return idade >= 18;
}
