pragma solidity ^0.5.0;


// 1. Create Posts
// 2. List all Posts
// 3. Tip Posts

contract SocialNetwork {
    string public name;
    uint256 public postCount = 0;
    mapping(uint256 => Post) public posts;

    struct Post {
        uint256 id;
        string content;
        uint256 tipAmount;
        address payable author;
    }

    event PostCreated(
        uint256 id,
        string content,
        uint256 tipAmount,
        address payable author
    );

    event PostTipped(
        uint256 id,
        string content,
        uint256 tipAmount,
        address payable author
    );

    constructor() public {
        name = "DApp Social Network";
    }

    // Using underscore for Local variables
    function createPost(string memory _content) public {
        // Require valid content
        require(bytes(_content).length > 0, "Post content is empty");

        // Increment the post count
        postCount++;

        // Create the post
        posts[postCount] = Post(postCount, _content, 0, msg.sender);

        // Trigger Event
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint256 _id) public payable {
        //
        require(_id > 0 && _id <= postCount, "Post does not exist");

        // Fetch the post
        Post memory _post = posts[_id];

        // Fetch the author of the post
        address payable _author = _post.author;

        // Pay the author by sending the tip amount
        address(_author).transfer(msg.value);

        // Increment the tip amount
        _post.tipAmount = _post.tipAmount + msg.value;
        // Update the post
        posts[_id] = _post;

        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}
