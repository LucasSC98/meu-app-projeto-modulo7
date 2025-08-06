import { cpf as cpfValidator } from "cpf-cnpj-validator";
import emailValidator from "email-validator";

export function validarCPF(cpf: string): boolean {
  return cpfValidator.isValid(cpf);
}
export function validarEmail(email: string): boolean {
  return emailValidator.validate(email);
}
