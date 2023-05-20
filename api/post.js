import { Request } from '../helper/http';

const request = new Request;

export class PostAPI {

  createPost(name, content) {
    return request.post('post', {name, content});
  }

  getAllPost() {
    return request.get('posts');
  }
}