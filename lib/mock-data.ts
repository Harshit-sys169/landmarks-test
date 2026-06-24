import { ImageSourcePropType } from "react-native";

export type MockFeedPost = {
  id: string;
  displayName: string;
  username: string;
  parkName: string;
  caption: string;
  image: ImageSourcePropType;
  likesCount: number;
  commentsCount: number;
};

export const mockFeedPosts: MockFeedPost[] = [
  {
    id: "1",
    displayName: "Ava Brooks",
    username: "@avaexplores",
    parkName: "Yellowstone National Park",
    caption: "Golden hour at the falls never gets old.",
    image: require("../assets/mock-data/mock-1.jpg"),
    likesCount: 184,
    commentsCount: 22,
  },
  {
    id: "2",
    displayName: "Noah Carter",
    username: "@noahtrails",
    parkName: "Yosemite National Park",
    caption: "The valley looked unreal after sunrise.",
    image: require("../assets/mock-data/mock-2.jpg"),
    likesCount: 241,
    commentsCount: 31,
  },
  {
    id: "3",
    displayName: "Mia Patel",
    username: "@miatravels",
    parkName: "Zion National Park",
    caption: "Red cliffs, quiet trails, perfect weather.",
    image: require("../assets/mock-data/mock-3.jpg"),
    likesCount: 156,
    commentsCount: 18,
  },
  {
    id: "4",
    displayName: "Ava Brooks",
    username: "@avaexplores",
    parkName: "Glacier National Park",
    caption: "One of the cleanest views I have ever seen.",
    image: require("../assets/mock-data/mock-1.jpg"),
    likesCount: 97,
    commentsCount: 11,
  },
  {
    id: "5",
    displayName: "Noah Carter",
    username: "@noahtrails",
    parkName: "Grand Teton National Park",
    caption: "Sharp peaks and a very calm lake.",
    image: require("../assets/mock-data/mock-2.jpg"),
    likesCount: 203,
    commentsCount: 26,
  },
  {
    id: "6",
    displayName: "Mia Patel",
    username: "@miatravels",
    parkName: "Bryce Canyon National Park",
    caption: "The colors here look fake in real life.",
    image: require("../assets/mock-data/mock-3.jpg"),
    likesCount: 142,
    commentsCount: 14,
  },
];