const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Define a template for blog post
  const singlePost = path.resolve('./src/templates/single-post.js');
  const listPosts = path.resolve('./src/templates/post-list.js');

  // Get all markdown blog posts sorted by date
  const allPosts = await graphql(
    `
      {
        posts: allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        },
        blog: allMarkdownRemark(
          filter: { fields: { collection: { eq: "blog" } }}
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        },
        portfolio: allMarkdownRemark(
          filter: { fields: { collection: { eq: "portfolio" } }}
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    `
  );

  if (allPosts.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts',
      allPosts.errors
    );
    return;
  }

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL
  // const pages = [ allPosts.data.blog.nodes, allPosts.data.portfolio.nodes ];

  const blog = allPosts.data.blog.nodes;
  blog.forEach((post, index) => {
    const previous = index === blog.length - 1 ? null : blog[index + 1];
    const next = index === 0 ? null : blog[index - 1];

    createPage({
      path: post.fields.slug,
      component: singlePost,
      context: {
        slug: post.fields.slug,
        previous,
        next,
      },
    });
  });

  const portfolio = allPosts.data.portfolio.nodes;
  portfolio.forEach((post, index) => {
    const previous = index === portfolio.length - 1 ? null : portfolio[index + 1];
    const next = index === 0 ? null : portfolio[index - 1];

    createPage({
      path: post.fields.slug,
      component: singlePost,
      context: {
        slug: post.fields.slug,
        previous,
        next,
      },
    });
  });


  const postsPerPage = 2;
  
  const blogs = allPosts.data.blog.nodes;
  let numPages = Math.ceil(blogs.length / postsPerPage);
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/blog' : `/blog/${i + 1}`,
      component: listPosts,
      context: {
        type: 'blog',
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1
      },
    });
  });

  const projects = allPosts.data.portfolio.nodes;
  numPages = Math.ceil(projects.length / postsPerPage);
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/portfolio' : `/portfolio/${i + 1}`,
      component: listPosts,
      context: {
        type: 'portfolio',
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    const slug = createFilePath({ node, getNode, basePath: 'pages' });
    const collection = getNode(node.parent).sourceInstanceName;

    createNodeField({
      node,
      name: 'collection',
      value: collection,
    });

    createNodeField({
      node,
      name: 'slug',
      value: `/${collection}${slug}`,
    });
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }

    type Fields {
      slug: String
    }
  `);
};