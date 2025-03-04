export function getCmsImage(matchingData:any): { hasImage: boolean, imageLocation: any, altText: string } {
  const umbracoImage = matchingData?.image?.url ? true : false;
  const sanityImage = matchingData?.image?.asset?.url ? true : false;

  const hasImage = umbracoImage || sanityImage;
  const imageLocation = umbracoImage ? matchingData?.image?.url : sanityImage ? matchingData?.image?.asset?.url : "None";

  let altText = "";
  if (umbracoImage) {
    altText = matchingData?.image?.altText !== "" ? matchingData?.image?.altText : matchingData?.image?.name !== "" ? matchingData?.image?.name : matchingData?.name;
  } else if (sanityImage) {
    altText = matchingData?.image?.asset?.altText !== "" ? matchingData?.image?.asset?.altText : matchingData?.image?.asset?.name !== "" ? matchingData?.image?.asset?.name : matchingData?.name;
}

  return { hasImage, imageLocation, altText };
}