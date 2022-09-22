import { gql } from '@apollo/client/core';
import { Client } from '@xmtp/xmtp-js';
import { apolloClient } from '../apollo-client';
import { login } from '../authentication/login';
import { getAddressFromSigner, getSigner } from '../ethers.service';

const GET_PROFILE = `
  query($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
        id
        ownedBy
    }
  }
`;

export interface ProfileRequest {
  profileId?: string;
  handle?: string;
}

const getProfileRequest = (request: ProfileRequest) => {
  return apolloClient.query({
    query: gql(GET_PROFILE),
    variables: {
      request,
    },
  });
};

export const sendMessage = async (profileId: string = '0x4814') => {
  const address = getAddressFromSigner();
  await login(address);

  console.log('send message: sender address', address);

  const request = { profileId };
  const profile = await getProfileRequest(request);

  console.log('send message: recipient address', profile.data.profile.ownedBy);

  const client = await Client.create(getSigner());
  const message = await client.sendMessage(profile.data.profile.ownedBy, 'gm');

  console.log('send message: sent content', message.content);

  return message;
};

(async () => {
  await sendMessage();
})();
