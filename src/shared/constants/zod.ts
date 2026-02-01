export const STRING_REGEX = {
  // Básicas
  lettersOnly: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/,
  lettersUppercaseOnly: /^[A-ZÁÉÍÓÚÑ]+$/,
  lettersUppercaseAsciiOnly: /^[A-Z]+$/,
  numbersOnly: /^[0-9]+$/,
  numbersSpaces: /^[0-9 ]+$/,
  lettersNumbers: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9]+$/,
  lettersSpaces: /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/,
  lettersNumbersSpaces: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/,

  // Espacios
  noLeadingTrailingSpaces: /^(?!\s)(.*\S)?$/,
  singleSpacesOnly: /^[^\s]+(\s[^\s]+)*$/,

  // Texto
  alphaNumericWithSymbols: /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ .,_\-@#]+$/,

  // Identificadores
  username: /^[a-zA-Z0-9._-]{3,20}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // Contacto
  emailSimple: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneSimple: /^[0-9+()\- ]{7,20}$/,

  // Seguridad
  passwordBasic: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,

  // Latin1
  latin1safe:
    /^[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑçÇåÅäÄöÖß¿¡?!@#$%&*+\-=_~^()\[\]{}<>\/|:;,.'" ]*$/,

  // Emojis
  noeEmojis: /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]*$/u,
};
