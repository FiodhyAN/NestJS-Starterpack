import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { PrismaService } from 'src/core/services/prisma.service';

export function IsEqualTo(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsEqualTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (relatedValue === undefined) {
            return false;
          }

          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}

type IsUniqueInterface = {
  tableName: string;
  column: string;
};

export function IsUnique(
  options: IsUniqueInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    const prisma = new PrismaService();
    registerDecorator({
      name: 'IsUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const { tableName, column }: IsUniqueInterface = args.constraints[0];
          if (!prisma) {
            throw new Error(
              'PrismaService is not available for the validation.',
            );
          }
          const dataExist = await prisma[tableName].findFirst({
            where: {
              [column]: value,
            },
          });

          return !dataExist;
        },

        defaultMessage(validationArguments: ValidationArguments): string {
          const field: string = validationArguments.property;
          return `${field} already exists`;
        },
      },
    });
  };
}
