import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { SettingsIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { VStack } from "@/components/ui/vstack";
import { useActionSheet } from "@/contexts/ActionSheetContext";
import { useDrawer } from "@/contexts/DrawerContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

import { Dimensions, StyleSheet, Text, View } from "react-native";
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, User } from "firebase/auth"
import { auth, db } from "../../firebaseConfig"
import { collection, deleteDoc, doc, DocumentData, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";


const { width, height } = Dimensions.get("window");
import { Colors } from "@/constants/Colors";
import { pickImage, uriToBlob } from "@/utils/image_functions";
import { saveUrlToFirestore, uploadProfileImageToCloud } from "@/utils/cloud_storage";
import { saveToken } from "@/notifications";
import { Collections } from "@/constants/Collections";

export default function Account() {
  const { openActionSheet, setBodyContent, closeActionSheet } = useActionSheet();
  const { openDrawer, setDrawerContent } = useDrawer();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData>()
  const [accountEmail, setAccountEmail] = useState<string | null>("")




  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setAccountEmail(currentUser.email)
        setUser(currentUser)
      }
      else {
        setUser(null)
      }
    });
    return () => unsubscribe()
  }, [])


  useEffect(() => {
    const usersColl = collection(db, "users")

    const userRef = doc(usersColl, auth.currentUser?.uid)


    const unsub = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data())


        console.log(userData)
      }

    })

    return () => unsub()

  }, [])


  const signOutFromAccount = () => {
    signOut(auth).then(() => {
      console.log("user sign Out succes!")
    }).catch((e) => {
      console.log(e)
    })
  }

  const deleteAccount = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid)
      await deleteDoc(userRef)
      await deleteUser(auth.currentUser!)
    } catch (e) {
      console.log(e)
    }
  }


  const openProfilePhotoActionSheet = () => {
    openActionSheet()
    setBodyContent(<ProfilePhotoMenu />) // for the action sheet

  }



  return (

    <>
      {user ? <View
        style={styles.accountViewStyle}
      >
        <VStack
          style={styles.accountContainerVStackStyle}

        >
          {/* header */}
          <Box style={styles.settingsIconContainerStyle}>

            <Button onPress={() => {
              console.log("settings");
              setDrawerContent(
                <SettingsBody />
              )
              openDrawer()
            }} variant="outline" style={{ borderWidth: 0 }}>
              <ButtonIcon as={SettingsIcon} style={styles.settingsIconStyle} color={Colors.lightBlue} />
            </Button>
          </Box>
          {/* Avatar */}
          <Box style={{ marginTop: 20, marginBottom: 20 }}>
            <Pressable onPress={openProfilePhotoActionSheet}>
              <Avatar size="2xl" style={{ borderWidth: 2, borderColor: Colors.primary }}>
                <AvatarFallbackText>Icon</AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri: userData?.profilePictureUrl
                  }}
                ></AvatarImage>
                <AvatarBadge />
              </Avatar>
            </Pressable>
          </Box>

          <Text
            style={styles.accountEmailText}
          >
            {accountEmail}
          </Text>

          <Box style={{ marginTop: 60, width: "100%", alignItems: "center" }}>
            <VStack style={styles.vStackStyle}>
              {/* Mon Compte */}
              <Pressable onPress={() => {
                openActionSheet()
                setBodyContent(
                  <AccountBody onSubmit={() => {
                    setTimeout(() => {
                      closeActionSheet()
                    }, 1000)
                  }} />
                )
              }} style={styles.pressableStyle}>
                <HStack style={{ alignItems: "center", gap: 15 }}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person" color={Colors.lightBlue} size={20}></Ionicons>
                  </View>
                  <Text style={styles.accountText}>
                    Mon Compte
                  </Text>
                </HStack>
                <Ionicons name="chevron-forward" color={Colors.lightBlue} size={20}></Ionicons>
              </Pressable>

              {/* Mes Informations personelles */}
              <Pressable
                onPress={() => {
                  openActionSheet()
                  setBodyContent(
                    <PersonaInfoBody />
                  )
                }}
                style={styles.pressableStyle}
              >
                <HStack style={{ alignItems: "center", gap: 15 }}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="information-circle" color={Colors.lightBlue} size={20}></Ionicons>
                  </View>
                  <Text style={styles.accountText}>
                    Mes Informations
                  </Text>
                </HStack>
                <Ionicons name="chevron-forward" color={Colors.lightBlue} size={20}></Ionicons>
              </Pressable>

              {/* Se deconnecter */}
              <Pressable
                onPress={() => {
                  signOutFromAccount()
                }}
                style={[styles.pressableStyle, { marginTop: 20, backgroundColor: "rgba(220, 53, 69, 0.1)" }]}
              >
                <HStack style={{ alignItems: "center", gap: 15 }}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(220, 53, 69, 0.2)" }]}>
                    <Ionicons name="log-out" color={Colors.error} size={20}></Ionicons>
                  </View>
                  <Text style={[styles.accountText, { color: Colors.error }]}>
                    Se deconnecter
                  </Text>
                </HStack>
              </Pressable>

              {/* Supprimer le compte */}
              <Pressable
                onPress={() => {
                  deleteAccount()
                }}
                style={[styles.pressableStyle, { marginTop: 20, backgroundColor: "rgba(220, 53, 69, 0.1)" }]}
              >
                <HStack style={{ alignItems: "center", gap: 15 }}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(220, 53, 69, 0.2)" }]}>
                    <MaterialIcons name="delete" color={Colors.error} size={20}></MaterialIcons>
                  </View>
                  <Text style={[styles.accountText, { color: Colors.error }]}>
                    Supprimer le Compte
                  </Text>
                </HStack>
              </Pressable>

            </VStack>
          </Box>
        </VStack>

      </View> : <LoginScreen></LoginScreen>}
    </>
  );
}


function PersonaInfoBody() {
  const nameLabel: string = "Prénom"
  const namePlaceholder: string = "Entrer votre prénom"
  const familyNameLabel: string = "Nom de Famille"
  const familyNamePlaceholder: string = "Entrer votre prénom"
  const buttonLabel: string = "Modifier"
  const { closeActionSheet } = useActionSheet()

  const [name, setName] = useState<string>()
  const [familyName, setFamilyName] = useState<string>()
  const [spinnerIsVisible, setSpinnerIsVisible] = useState<boolean>(false)



  const updateUserInfo = async () => {
    setSpinnerIsVisible(true)
    const usersCollection = collection(db, "users")
    const currentUserId = auth.currentUser?.uid
    const userRef = doc(usersCollection, currentUserId)

    await updateDoc(userRef, {
      name: name,
      familyName: familyName
    }).finally(() => {
      closeActionSheet()
    })


  }

  return (
    <View>
      <View style={styles.actionbSheetBodyContainerStyle}>
        <VStack style={styles.vStackStyle}>

          <FormControl style={styles.formControlStyle} >
            <FormControlLabel>
              <FormControlLabelText style={{ color: Colors.lightBlue }}>{nameLabel}</FormControlLabelText>
            </FormControlLabel>
            <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
              <InputField style={styles.inputFieldStyle} onChangeText={setName} placeholder={namePlaceholder} defaultValue={name}></InputField>
            </Input>
          </FormControl>

          <FormControl style={styles.formControlStyle} >
            <FormControlLabel>
              <FormControlLabelText style={{ color: Colors.lightBlue }}>{familyNameLabel}</FormControlLabelText>
            </FormControlLabel>
            <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
              <InputField style={styles.inputFieldStyle} onChangeText={setFamilyName} placeholder={familyNamePlaceholder} defaultValue={familyName}></InputField>
            </Input>
          </FormControl>
          <Button style={styles.submitButtonStyle} onPress={async () => {
            await updateUserInfo()
          }}>
            {spinnerIsVisible ? <ButtonSpinner color={Colors.white} /> : <ButtonText>{buttonLabel}</ButtonText>}
          </Button>
        </VStack>
      </View>
    </View>
  )
}


function AccountBody({ onSubmit }: { onSubmit: () => void }) {
  const [spinnerIsVisible, setSpinnerIsVisible] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(auth.currentUser?.email!)
  const [accountPassword, setAccountPassword] = useState<string | null>("")

  const updateUserAccountInfo = async () => {
    try {
      setSpinnerIsVisible(true);
      if (auth.currentUser?.email !== accountEmail) {
        await updateEmail(auth.currentUser!, accountEmail!)
      }

      if (accountPassword?.length! > 0) {
        await updatePassword(auth.currentUser!, accountPassword!)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setSpinnerIsVisible(false);
      onSubmit();
    }
  }

  const emailPlaceholder: string = "Entrer votre email"
  const emailLabel: string = "Email"
  const emailExemple: string = "mancer@abdel.com"

  const passwordPlaceholder: string = "Entrer votre mot de passe"
  const passwordLabel: string = "Mot de passe"
  const passwordExemple: string = "mancer@abdel.com"

  const buttonLable: string = "Modifier"
  return (
    <View style={styles.actionbSheetBodyContainerStyle}>
      <VStack style={styles.vStackStyle}>

        <FormControl style={styles.formControlStyle} >
          <FormControlLabel>
            <FormControlLabelText style={{ color: Colors.lightBlue }}>{emailLabel}</FormControlLabelText>
          </FormControlLabel>
          <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
            <InputField style={styles.inputFieldStyle} onChangeText={setAccountEmail} placeholder={emailPlaceholder} defaultValue={accountEmail!}></InputField>
          </Input>
        </FormControl>

        <FormControl style={styles.formControlStyle} >
          <FormControlLabel>
            <FormControlLabelText style={{ color: Colors.lightBlue }}>{passwordLabel}</FormControlLabelText>
          </FormControlLabel>
          <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
            <InputField style={styles.inputFieldStyle} onChangeText={setAccountPassword} type="password" placeholder={passwordPlaceholder} defaultValue={passwordExemple}></InputField>
          </Input>
        </FormControl>
        <Button style={styles.submitButtonStyle} onPress={updateUserAccountInfo}>
          {spinnerIsVisible ? <ButtonSpinner color={Colors.white} /> : <ButtonText>{buttonLable}</ButtonText>}
        </Button>
      </VStack>
    </View>
  )
}


function SettingsBody() {
  return (
    <View>
      <VStack style={styles.settingsBodyHeaderContainerStyle}>
        <Text style={styles.settingsBodyHeaderTextStyle}>Settings</Text>
        <Divider style={styles.settingsBodyHeaderDividerStyle} />
      </VStack>
      <VStack style={styles.settingsBodyHeaderContainerStyle} >
        <HStack style={styles.switchContainerStyle}>
          <Text style={styles.switchText}>clair</Text>
          <Switch size="lg"></Switch>
          <Text style={styles.switchText}>obscur</Text>
        </HStack>
      </VStack>
    </View>
  )
}

function LoginScreen() {
  const registerLabel: string = "S'Inscrire"
  const emailPlaceholder: string = "Entrer votre email"
  const passwordPlaceholder: string = "Entrer votre mot de passe"
  const emailLabel: string = "Email"
  const passwordLabel: string = 'Mot De Passe'

  const [registerSectionVisibility, setRegisterSectionVisibility] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loader, setLoader] = useState<boolean>(false)

  const handleLogin = async () => {
    try {
      setLoader(true)
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      await saveToken(Collections.users, userCredentials.user.uid)

    } catch (e) {
      console.log(e)
    } finally {
      setLoader(false)

    }
  }

  return (
    <>
      {
        registerSectionVisibility === false ? <View style={styles.loginViewContainerStyle}>
          <View style={styles.loginScreenTitleContainer}><Text style={styles.authScreenTitle}>Connexion</Text></View>

          <Divider style={styles.settingsBodyHeaderDividerStyle}></Divider>
          <FormControl style={styles.formControlStyle}>
            <FormControlLabel>
              <FormControlLabelText style={{ color: Colors.lightBlue }}>{emailLabel}</FormControlLabelText>
            </FormControlLabel>
            <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
              <InputField style={styles.inputFieldStyle} onChangeText={setEmail} value={email} type="text" placeholder={emailPlaceholder}></InputField>
            </Input>
          </FormControl>

          <FormControl style={styles.formControlStyle}>
            <FormControlLabel>
              <FormControlLabelText style={{ color: Colors.lightBlue }}>{passwordLabel}</FormControlLabelText>
            </FormControlLabel>
            <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
              <InputField style={styles.inputFieldStyle} onChangeText={setPassword} value={password} type="password" placeholder={passwordPlaceholder}>
              </InputField>
            </Input>
          </FormControl>
          <Button onPress={handleLogin} style={styles.submitButtonStyle}>
            <ButtonText>Se Connecter</ButtonText>
            {loader && <ButtonSpinner color={Colors.white}></ButtonSpinner>}
          </Button>
          <Pressable onPress={() => {
            setRegisterSectionVisibility(true)
          }}>
            <Text style={{ color: Colors.primary, marginTop: 10 }}>{registerLabel}</Text>
          </Pressable>
        </View> : <RegisterScreen setRegisterVisibility={() => setRegisterSectionVisibility(false)} />
      }
    </>
  )
}

function RegisterScreen({ setRegisterVisibility }: { setRegisterVisibility: () => void }) {

  const loginLabel: string = "Se Connecter"
  const emailPlaceholder: string = "Entrer votre email"
  const passwordPlaceholder: string = "Entrer votre mot de passe"
  const passwordConfirmPlaceholder: string = "Confirmer votre Mot de passe"

  const emailLabel: string = "Email"
  const passwordLabel: string = 'Mot De Passe'
  const passwordConfirmLabel: string = 'Confimer Mot De Passe'

  const [loader, setLoader] = useState<boolean>(false)
  const [password, setPassword] = useState<string>()
  const [passwordConfirm, setPasswordConfirm] = useState<string>()
  const [email, setEmail] = useState<string>()



  const handleRegister = async () => {
    try {
      setLoader(true)
      if (password === passwordConfirm && email?.length! > 0) {
        const userCredentials = await createUserWithEmailAndPassword(auth, email!, password!)

        const user = userCredentials.user

        await saveToken(Collections.users, user.uid)

        await setDoc(doc(db, Collections.users, user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }).then(() => console.log("document is created")).
          catch(e => console.log(e))
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoader(false)
    }

  }
  return (
    <View style={styles.loginViewContainerStyle}>
      <View style={styles.loginScreenTitleContainer}><Text style={styles.authScreenTitle}>S'inscrire</Text></View>

      <Divider style={styles.settingsBodyHeaderDividerStyle}></Divider>
      <FormControl style={styles.formControlStyle}>
        <FormControlLabel>
          <FormControlLabelText style={{ color: Colors.lightBlue }}>{emailLabel}</FormControlLabelText>
        </FormControlLabel>
        <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
          <InputField style={styles.inputFieldStyle} onChangeText={setEmail} value={email} type="text" placeholder={emailPlaceholder}></InputField>
        </Input>
      </FormControl>

      <FormControl style={styles.formControlStyle}>
        <FormControlLabel>
          <FormControlLabelText style={{ color: Colors.lightBlue }}>{passwordLabel}</FormControlLabelText>
        </FormControlLabel>
        <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
          <InputField style={styles.inputFieldStyle} onChangeText={setPassword} defaultValue={password} type="password" placeholder={passwordPlaceholder}>
          </InputField>
        </Input>
      </FormControl>

      <FormControl style={styles.formControlStyle}>
        <FormControlLabel>
          <FormControlLabelText style={{ color: Colors.lightBlue }}>{passwordConfirmLabel}</FormControlLabelText>
        </FormControlLabel>
        <Input style={{ borderColor: Colors.primary, borderRadius: 10 }}>
          <InputField style={styles.inputFieldStyle} onChangeText={setPasswordConfirm} defaultValue={passwordConfirm} type="password" placeholder={passwordConfirmPlaceholder}>
          </InputField>
        </Input>
      </FormControl>

      <Button onPress={handleRegister} style={styles.submitButtonStyle}>
        <ButtonText>Se Connecter</ButtonText>
        {loader && <ButtonSpinner color={Colors.white}></ButtonSpinner>}
      </Button>
      <Pressable onPress={() => {
        setRegisterVisibility()
      }}>
        <Text style={{ color: Colors.primary, marginTop: 10 }}>{loginLabel}</Text>
      </Pressable>
    </View>
  )
}


function ProfilePhotoMenu() {

  async function updateProfilePicture() {
    const uri = await pickImage()
    if (!uri) return

    const downloadUrl = await uploadProfileImageToCloud(auth.currentUser?.uid, uri)

    await saveUrlToFirestore(auth.currentUser?.uid, downloadUrl)

  }

  return (
    <View style={styles.profileMenuContainer}>
      <Pressable onPress={async () => {
        await updateProfilePicture()
      }} style={styles.pressableSection}>
        <Ionicons name="person" color={"black"}></Ionicons>
        <Text>Choisir une photo</Text>
      </Pressable>
    </View>
  )

}



const styles = StyleSheet.create({
  accountViewStyle: {
    backgroundColor: Colors.white, // Keeping the requested background color#112D4E
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  accountContainerVStackStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "15%",
    width: "100%",
  },
  accountEmailText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },
  accountText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  settingsIconContainerStyle: {
    marginTop: 10,
    marginRight: 20,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    width: "100%",
  },
  pressableStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.transparentPrimary,
    padding: 16,
    borderRadius: 12,
    width: "90%",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  vStackStyle: {
    gap: 12,
    width: "100%",
    alignItems: "center",
  },
  actionbSheetBodyContainerStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",

  },
  formControlStyle: {
    width: "90%",
  },
  submitButtonStyle: {
    marginTop: 20,
    width: "90%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
  },

  settingsBodyHeaderContainerStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 20,
    marginTop: height * 0.08,
  },
  settingsBodyHeaderTextStyle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
  },
  settingsBodyHeaderDividerStyle: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    width: "85%",
  },
  switchContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 20,
  },
  switchText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
  },

  //Login Style
  loginViewContainerStyle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: height,
    gap: 20,
    backgroundColor: Colors.darkBlue, // Matched to account view
  },
  loginScreenTitleContainer: {
    display: "flex",
    marginTop: height * 0.1
  },
  authScreenTitle: {
    fontSize: 32,
    color: Colors.offWhite,
    fontWeight: "700"
  },

  // inputs field styles
  inputFieldStyle: {
    color: Colors.offWhite
  },


  //Photo Profile Menu
  pressableSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.transparentWhite,
    padding: 16,
    borderRadius: 12,
    width: "90%",
  },

  profileMenuContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },

  //settings
  settingsIconStyle: {
    width: 30,
    height: 30
  }
})