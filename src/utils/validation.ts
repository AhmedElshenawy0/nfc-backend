import z from "zod";

export const signUpValidation = z.object({
  firstName: z
    .string({
      required_error: "First name is required",
      invalid_type_error: "First name should be of type string",
    })
    .min(3, "firstName must be at least 3 characters"),
  lastName: z
    .string({
      required_error: "last name is required",
      invalid_type_error: "last name should be of type string",
    })
    .min(3, "lastName must be at least 3 characters"),
  email: z
    .string({
      required_error: "email is required",
    })
    .email("Invalid email address"),
  password: z
    .string({
      required_error: "password is required",
      invalid_type_error: "password should be of type string",
    })
    .min(6, "Password must be at least 6 characters"),
  phone: z.string({
    required_error: "phone is required",
    invalid_type_error: "phone should be of type string",
  }),
  city: z.string({
    required_error: "city is required",
    invalid_type_error: "city should be of type string",
  }),
  birthday: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val)),
  job: z.string({
    required_error: "date is required",
    invalid_type_error: "date should be of type string",
  }),
});

export const signInValidation = z.object({
  email: z
    .string({
      required_error: "email is required",
    })
    .email("Invalid email address"),
  password: z
    .string({
      required_error: "password is required",
      invalid_type_error: "password should be of type string",
    })
    .min(6, "Password must be at least 6 characters"),
});

export const vCardValidation = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  job: z.string({
    required_error: "Job is required",
  }),
  bio: z.string({
    required_error: "Bio is required",
  }),
  about: z.string({
    required_error: "About is required",
  }),
  phone: z.string({
    required_error: "Phone is required",
  }),
  address: z.string({
    required_error: "Address is required",
  }),
});
