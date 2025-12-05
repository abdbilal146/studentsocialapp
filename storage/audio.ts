import { getBlob, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";


export async function uploadAudio(path: string, uri: any) {
    const storage = getStorage()
    const audioRef = ref(storage, path)

    const audio = await fetch(uri)
    const blob = await audio.blob()


    await uploadBytes(audioRef, blob)

    const downloadUrl = await getDownloadURL(audioRef)

    return downloadUrl


}