import { FormControl } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { View } from "react-native";





export default function Search() {
    return (
        <>
            <View>
                <FormControl>
                    <Input>
                        <InputField></InputField>
                    </Input>
                </FormControl>
            </View>
        </>
    )
}