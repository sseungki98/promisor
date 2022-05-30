import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";
import api from "../auth/api";
import { selectedGroupState } from "../states/selectedGroup";
import markerImg from "../image/marker.png";
import PromiseLocationMap from "../organisms/PromiseLocationMap";
import PlaceList from "../organisms/PlaceList";
import styled from "styled-components";
import { BoxInput } from "../styles/Input";

declare var naver: any;
declare global {
  interface Window {
    kakao: any;
  }
}
const { kakao } = window;

interface ILocation {
  teamId: number;
  latitude: number;
  longitude: number;
}

interface IPlace {
  address_name: string;
  place_name: string;
  place_url: string;
  category_group_name: string;
}
const PromiseLocation = () => {
  const selectedGroup = useRecoilValue(selectedGroupState);
  const [myLat, setMyLat] = useState<number>();
  const [myLon, setMyLon] = useState<number>();
  const [places, setPlaces] = useState<IPlace[]>();
  const queryClient = useQueryClient();

  useEffect(() => {
    getMidLocation();
  }, []);
  const { mutate: editLocation } = useMutation(
    "editLocation",
    async () => {
      const requestBody = {
        teamId: selectedGroup.id,
        latitude: myLat,
        longitude: myLon,
      };
      return await api.patch("/groups/location", requestBody);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getMidLocation");
      },
    }
  );
  const { mutate: getMidLocation, data } = useMutation(
    "getMidLocation",
    async () => {
      const { data } = await api.get(`/groups/mid-point/${selectedGroup.id}`);

      return data;
    },
    {
      onSuccess: async (data) => {
        initMap(data);
        searchDetailAddrFromCoords(data, function (result: any, status: any) {
          if (status === kakao.maps.services.Status.OK) {
            const address_name = result[0].address.address_name;
            document.querySelector(".title").innerHTML = address_name;
            ps.keywordSearch(`${address_name} 맛집`, placesSearchCB);
          }
        });
      },
    }
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setMyLat(position.coords.latitude);
          setMyLon(position.coords.longitude);
        }
      );
    }
  }, []);

  const initMap = (midLocation: ILocation) => {
    const map = new naver.maps.Map("map", {
      center: new naver.maps.LatLng(
        midLocation.latitude,
        midLocation.longitude
      ),
      zoom: 13,
    });
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(
        midLocation.latitude,
        midLocation.longitude
      ),
      map: map,
      icon: {
        content: `
          <img alt="marker" style="width: 1em; height:1em;" src=${markerImg} />
        `,
      },
    });
  };

  var geocoder = new kakao.maps.services.Geocoder();
  function searchDetailAddrFromCoords(
    midLocation: ILocation,
    callback: Function
  ) {
    if (midLocation) {
      geocoder.coord2Address(
        midLocation.longitude,
        midLocation.latitude,
        callback
      );
    }
  }
  var ps = new kakao.maps.services.Places();

  const placesSearchCB = (data: any, status: any) => {
    if (status === kakao.maps.services.Status.OK) {
      setPlaces(data);
    }
  };
  const fixedPlaceRef = useRef();
  return (
    <div>
      <BoxInput placeholder="만남 장소" ref={fixedPlaceRef} />
      <div
        style={{
          marginBlock: "1em",
          display: "flex",
          flexDirection: "row",
          gap: "0.5em",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title>중간 지점</Title>
        <span className="title"></span>
      </div>
      <PromiseLocationMap />
      <PlaceList places={places} />
    </div>
  );
};
export default PromiseLocation;
const Title = styled.span`
  color: ${(p) => p.theme.green};
`;
