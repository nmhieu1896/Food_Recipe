export default class Like {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);
    this.persistData();
    return like;
  }

  deleteLike(id) {
    const index = this.likes.findIndex(like => like.id === id);
    const like = this.likes.splice(index, 1);
    this.persistData();
    return like;
  }

  isLiked(id) {
    return this.likes.findIndex(like => like.id === id) !== -1;
  }

  getNumberOfLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem("likes", JSON.stringify(this.likes));
  }

  getLocalData() {
    const localData = JSON.parse(localStorage.getItem("likes"));
    if (localData) this.likes = localData;
  }
}
