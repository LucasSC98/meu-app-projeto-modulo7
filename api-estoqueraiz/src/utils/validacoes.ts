import { cpf as cpfValidator } from "cpf-cnpj-validator";
import emailValidator from "email-validator";
import { Model, ModelStatic } from "sequelize";

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

export function validarCamposObrigatorios(
  dados: Record<string, any>,
  camposObrigatorios: string[]
): string[] {
  return camposObrigatorios.filter(
    (campo) =>
      dados[campo] === undefined ||
      dados[campo] === null ||
      dados[campo].toString().trim() === ""
  );
}

export function valorPositivo(value: number): boolean {
  return value >= 0;
}

export function valorMaiorQueZero(value: number): boolean {
  return value > 0;
}

interface ValidacaoId {
  model: ModelStatic<Model>;
  id: number | string;
  nomeCampo: string;
}

export async function validarExistenciasPorId(
  validacoes: ValidacaoId[]
): Promise<{ valido: boolean; mensagem?: string }> {
  for (const { model, id, nomeCampo } of validacoes) {
    const registro = await model.findByPk(id);
    if (!registro) {
      return {
        valido: false,
        mensagem: `${
          nomeCampo.charAt(0).toUpperCase() + nomeCampo.slice(1)
        } não foi encontrado(a). Verifique seu campo: ${nomeCampo.toLowerCase()}_id e tente novamente.`,
      };
    }
  }
  return { valido: true };
}
