import { Platform, TextInput, TextInputProps, View } from "react-native";
import clsx from "clsx";

import { colors } from "@/styles/colors";

type Variants = "primary" | "secondary" | "tertiary";

type InputProps = {
  children: React.ReactNode;
  Variant: Variants;
};

function Input({ children, Variant = "primary" }: InputProps) {
  return (
    <View
      className={clsx(
        "w-full h-16 flex-row items-center gap-2",
        {
          "h-14 px-4 border border-zinc-800": Variant !== "primary",
          "bg-zinc-950": Variant !== "secondary",
          "bg-zinc-900": Variant !== "tertiary",
        }
      )}
    >
      {children}
    </View>
  );
}

function Field({placeholder, ...rest }: TextInputProps) {
  return (
    <TextInput
      className="flex-1 text-zinc-100 text-lg font-regular"
      placeholderTextColor={colors.zinc[400]}
      placeholder={placeholder}
      cursorColor={colors.zinc[100]}
      {...rest}
    />
  );
}

Input.Field = Field;

export { Input };
