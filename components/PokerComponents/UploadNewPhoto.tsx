import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState , SetStateAction , Dispatch} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  isUploadNewPhotoState,
} from "../../PokerStateManagement/Atom";
import Cropper, { Point } from "react-easy-crop";
import { Popover, Transition } from "@headlessui/react";
import TextField from "@mui/material/TextField";
import Resizer from "react-image-file-resizer";
import getCroppedImg from "../../pages/api/PokerAPI/cropImage";
import {
  convertImageUrlToBase64,
} from "../../pages/api/PokerAPI/api";

interface props{
    setSelectedImage:Dispatch<SetStateAction<string>>,
    setIsSelectedImage: Dispatch<SetStateAction<boolean>>

}

function UploadNewPhoto({setSelectedImage , setIsSelectedImage} : props) {
    const [isUploadNewPhoto, setIsUploadNewPhoto] =useRecoilState(isUploadNewPhotoState);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<number>(0);
    const [showInvalidUrl, setShowInvalidUrl] = useState<boolean>(false);
    const [changeImageUrl, setChangeImageUrl] = useState<string>("");
    const [isUploadFromDevice, setIsUploadFromDevice] = useState<boolean>(false);
    const [isSelectUploadMode, setIsSelectUploadMode] = useState<boolean>(false);
    const [croppedImage, setCroppedImage] = useState<Blob>();

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = (await getCroppedImg(
        changeImageUrl,
        croppedAreaPixels
      )) as string;
      setSelectedImage(croppedImage);
      setIsSelectedImage(true);
      setIsUploadNewPhoto(false);
      setChangeImageUrl("");
      setIsSelectUploadMode(false);
      setZoom(1);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels]);

  function checkImage(url: string, callback: any) {
    const img = new Image();
    img.src = url;

    if (img.complete) {
      callback(true);
    } else {
      img.onload = () => {
        callback(true);
      };

      img.onerror = () => {
        callback(false);
      };
    }
  }

  function fileChangedHandler(event: any) {
    var fileInput = false;
    if (event.target.files[0]) {
      fileInput = true;
    }
    if (fileInput) {
      try {
        Resizer.imageFileResizer(
          event.target.files[0],
          1000,
          1000,
          "JPEG",
          150,
          0,
          (uri) => {
            let data = uri as string;
            setChangeImageUrl(data);
            setIsSelectUploadMode(true);
          },
          "Blob"
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <AnimatePresence>
      {isUploadNewPhoto && (
        <motion.div
          className="h-screen w-full fixed top-0 bg-black-opa80 left-0 flex justify-center items-center"
          style={{ zIndex: "100" }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isUploadNewPhoto && (
            <div
              className="flex flex-col justify-center items-start w-full max-w-lg bg-white py-8 px-8 rounded-3xl relative drop-shadow-lg overflow-hidden"
              style={{ height: isSelectUploadMode ? "650px" : "" }}
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 absolute top-2 right-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                onClick={() => {
                    setIsUploadNewPhoto(false);
                  setChangeImageUrl("");
                  setIsSelectUploadMode(false);
                  setZoom(1);
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {isSelectUploadMode ? (
                <>
                  <p
                    className="text-h4 text-secondary-gray-2 font-bold absolute"
                    style={{ top: "60px", left: "50px" }}
                  >
                    Crop your photo
                  </p>
                  <div
                    className="flex flex-col absolute rounded-xl top-28 overflow-hidden"
                    style={{ left: "50px", width: "410px", height: "336px" }}
                  >
                    <Cropper
                      image={changeImageUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      cropShape={"round"}
                      objectFit={"contain"}
                      showGrid={false}
                    />
                  </div>
                  <div
                    className=" absolute w-96 flex flex-col justify-center items-center gap-2"
                    style={{ top: "470px", left: "60px" }}
                  >
                    <div
                      className="flex justify-between items-center"
                      style={{ width: "360px" }}
                    >
                      <p className="text-secondary-gray-2">Zoom</p>
                      <p className="text-secondary-gray-2">
                        {zoom.toFixed(2)}%
                      </p>
                    </div>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => {
                        setZoom(Number(e.target.value));
                      }}
                      className="w-96"
                    />
                  </div>
                  <div
                    className="w-96 flex items-center justify-between absolute"
                    style={{ top: "580px", left: "60px" }}
                  >
                    <div
                      className="flex justify-center items-center text-blue font-bold text-p border-2 border-secondary-gray-4 py-3 px-5 rounded-lg hover:bg-primary-blue-3 cursor-pointer ease-in duration-200"
                      style={{ width: 180 }}
                      onClick={() => {
                        setIsSelectUploadMode(false);
                        setChangeImageUrl("");
                        setZoom(1);
                      }}
                    >
                      Cancel
                    </div>
                    <div
                      className="flex justify-center items-center text-white font-bold text-p border-2 border-blue py-3 rounded-lg bg-primary-blue-1 hover:bg-primary-blue-2 hover:border-primary-blue-2  cursor-pointer ease-in duration-200"
                      style={{ width: 180 }}
                      onClick={showCroppedImage}
                    >
                      Save
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col mt-8 w-full justify-center items-center">
                  <Popover
                    className="w-full flex justify-center items-center drop-shadow-lg bg-blue hover:cursor-pointer hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold rounded-md relative"
                    style={{ zIndex: 110 }}
                  >
                    <Popover.Button className="flex justify-center w-full items-center gap-2 py-2 outline-none">
                      <p className="font-semibold">Upload from url</p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </Popover.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Popover.Panel
                        className="flex bg-white flex-col justify-center items-center absolute top-5 -right-4 rounded-lg drop-shadow-lg px-4 py-2"
                        style={{ width: "480px" }}
                      >
                        <form
                          className="w-full h-fit"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            checkImage(
                              changeImageUrl,
                              async function (isImage: boolean) {
                                if (isImage) {
                                  try {
                                    let base64 = await convertImageUrlToBase64(
                                      changeImageUrl
                                    );
                                    setChangeImageUrl(base64);
                                    setIsSelectUploadMode(true);
                                  } catch (err) {
                                    console.log(err);
                                    setShowInvalidUrl(true);
                                    setTimeout(
                                      () => setShowInvalidUrl(false),
                                      2000
                                    );
                                  }
                                } else {
                                  setShowInvalidUrl(true);
                                  setTimeout(
                                    () => setShowInvalidUrl(false),
                                    2000
                                  );
                                }
                              }
                            );
                          }}
                        >
                          <TextField
                            required
                            fullWidth
                            variant="outlined"
                            label="Your image url"
                            size={"small"}
                            style={{ marginTop: "10px" }}
                            value={changeImageUrl}
                            onChange={(e) => setChangeImageUrl(e.target.value)}
                          />

                          <button
                            type="submit"
                            className="w-full flex justify-center items-center drop-shadow-lg bg-blue hover:cursor-pointer hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-4 mb-2"
                          >
                            Continue
                          </button>
                        </form>
                      </Popover.Panel>
                    </Transition>
                  </Popover>
                  <label className="w-full flex justify-center items-center drop-shadow-lg hover:cursor-pointer bg-tertiary-light-sky-blue hover:bg-primary-blue-2 duration-200 ease-in text-white font-semibold py-2 rounded-md mt-12 mb-6">
                    <p className="font-semibold mr-2">Upload from device</p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      name="myImage"
                      onChange={async (e) => {
                        let file: string;
                        if (
                          e.target.files !== null &&
                          e.target.files.length > 0
                        ) {
                          fileChangedHandler(e);
                        }
                      }}
                    />
                  </label>

                  <AnimatePresence>
                    {showInvalidUrl && (
                      <motion.div
                        className="absolute bottom-20 px-5 font-semibold text-white rounded-2xl drop-shadow-md"
                        style={{ zIndex: 120, backgroundColor: "#E60965" }}
                        animate={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        Image not exist
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default UploadNewPhoto