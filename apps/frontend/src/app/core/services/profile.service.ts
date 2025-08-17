import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { gql } from 'apollo-angular';
import { IApiResponse, IPaginatedResponse } from '../../shared/models/api-response.model';
import { IUser } from '../interfaces/user.interface';

// GraphQL Queries
const GET_MY_PROFILE_QUERY = gql`
  query GetMyProfile {
    myProfile {
      id
      email
      firstName
      lastName
      fullName
      avatar
      phoneNumber
      address
      dateOfBirth
      gender
      jobTitle
      bio
      website
      linkedin
      facebook
      twitter
      emailNotifications
      pushNotifications
      isProfilePublic
      lastLoginAt
      loginCount
      createdAt
      updatedAt
      roles
    }
  }
`;

const GET_USER_ACTIVITIES_QUERY = gql`
  query GetUserActivities($input: GetUserActivitiesInput!) {
    getUserActivities(input: $input) {
      metadata {
        statusCode
        message
      }
      data {
        id
        activityType
        description
        metadata
        ipAddress
        userAgent
        createdAt
      }
      meta {
        page
        limit
        itemCount
        pageCount
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

const GET_PROFILE_STATS_QUERY = gql`
  query GetProfileStats {
    profileStats
  }
`;

// GraphQL Mutations
const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      metadata {
        statusCode
        message
      }
      data {
        id
        email
        firstName
        lastName
        fullName
        phoneNumber
        address
        dateOfBirth
        gender
        jobTitle
        bio
        website
        linkedin
        facebook
        twitter
        emailNotifications
        pushNotifications
        isProfilePublic
      }
    }
  }
`;

const UPLOAD_AVATAR_MUTATION = gql`
  mutation UploadAvatar($avatarFile: Upload!) {
    uploadAvatar(avatarFile: $avatarFile) {
      metadata {
        statusCode
        message
      }
      data {
        id
        avatar
        avatarFile {
          id
          driveFileId
          originalName
        }
      }
    }
  }
`;

const REMOVE_AVATAR_MUTATION = gql`
  mutation RemoveAvatar {
    removeAvatar {
      metadata {
        statusCode
        message
      }
      data {
        id
        avatar
        avatarFile {
          id
        }
      }
    }
  }
`;

// Interfaces
export interface IUpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitle?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  isProfilePublic?: boolean;
}

export interface IGetUserActivitiesInput {
  page?: number;
  limit?: number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

export interface IUserActivity {
  id: number;
  activityType: string;
  description?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IProfileStats {
  user: IUser;
  activityStats: Array<{ type: string; count: number }>;
  recentActivities: IUserActivity[];
  totalActivities: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apollo = inject(Apollo);

  /**
   * Lấy thông tin profile của user hiện tại
   */
  getMyProfile(): Observable<IUser> {
    return this.apollo.query<{ myProfile: IUser }>({
      query: GET_MY_PROFILE_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.myProfile)
    );
  }

  /**
   * Cập nhật thông tin profile
   */
  updateProfile(input: IUpdateProfileInput): Observable<IApiResponse<IUser>> {
    return this.apollo.mutate<{
      updateProfile: IApiResponse<IUser>;
    }>({
      mutation: UPDATE_PROFILE_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data!.updateProfile)
    );
  }

  /**
   * Upload avatar
   */
  uploadAvatar(file: File): Observable<IApiResponse<IUser>> {
    return this.apollo.mutate<{
      uploadAvatar: IApiResponse<IUser>;
    }>({
      mutation: UPLOAD_AVATAR_MUTATION,
      variables: { avatarFile: file }
    }).pipe(
      map(result => result.data!.uploadAvatar)
    );
  }

  /**
   * Xóa avatar
   */
  removeAvatar(): Observable<IApiResponse<IUser>> {
    return this.apollo.mutate<{
      removeAvatar: IApiResponse<IUser>;
    }>({
      mutation: REMOVE_AVATAR_MUTATION
    }).pipe(
      map(result => result.data!.removeAvatar)
    );
  }

  /**
   * Lấy lịch sử hoạt động
   */
  getUserActivities(input: IGetUserActivitiesInput): Observable<IPaginatedResponse<IUserActivity>> {
    return this.apollo.query<{
      getUserActivities: IPaginatedResponse<IUserActivity>;
    }>({
      query: GET_USER_ACTIVITIES_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.getUserActivities)
    );
  }

  /**
   * Lấy thống kê profile
   */
  getProfileStats(): Observable<IProfileStats> {
    return this.apollo.query<{ profileStats: string }>({
      query: GET_PROFILE_STATS_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => JSON.parse(result.data.profileStats))
    );
  }
}
